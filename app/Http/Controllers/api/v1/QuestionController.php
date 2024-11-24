<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\ClientScore;
use App\Models\OwaWeight;
use App\Models\Question;
use App\Models\QuestionTeam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Exception;

class QuestionController extends Controller
{
    public function index(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'questionType' => 'in:DASS21,DASS42',
                'questionTeamId' => 'integer|nullable'
            ]);

            $questionType = $request->questionType;
            $questionTeams = QuestionTeam::whereHas('owaWeights', function ($owaQuery) use ($questionType) {
                $owaQuery->whereHas('question', function ($questionQuery) use ($questionType) {
                    $questionQuery->where('question_type', $questionType);
                });
            })->get();
            $questionTeamOptions = [];

            foreach ($questionTeams as $questionTeam) {
                $questionTeamOptions[] = [
                    'label' => "{$questionTeam->name} - {$questionTeam->method_type}",
                    'value' => $questionTeam->id
                ];                
            }
            
            $data = [];
            if ($request->questionTeamId !== null) {
                $questionList = Question::where('question_type', $request->questionType)->get();
                foreach ($questionList as $question) {
                    $data[] = [
                        'id' => $question->id,
                        'question' => $question->question
                    ];
                }
            }

            return response()->json([
                'teamOptions' => $questionTeamOptions,
                'data' => $data,
                'message' => 'Index successful',
            ]);
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Index failed, server error'
            ], 500);
        }
    }

    public function calculateClientScore(Request $request): JsonResponse {
        try {
            $request->validate([
                'questions' => 'required',
                'questionTeamId' => 'required|integer'
            ]);

            foreach ($request->questions as $questionId => $score) {
                Validator::validate([
                    'questionId' => $questionId,
                    'score' => $score
                ], [
                    'questionId' => 'required|integer',
                    'score' => 'required|integer|min:0|max:4'
                ]);
            }

            $user = Auth::user();
            if ($user->profile->role->slug === 'cli') {
                // main calculation
                $depressionScore = 0;
                $anxietyScore = 0;
                $stressScore = 0;
                foreach ($request->questions as $questionId => $score) {
                    $weights = OwaWeight::where('question_team_id', $request->questionTeamId)
                                        ->where('question_id', $questionId)
                                        ->first();

                    if ($weights) {
                        $depressionScore += $score * $weights->depression_weight;
                        $anxietyScore += $score * $weights->anxiety_weight;
                        $stressScore += $score * $weights->stress_weight;
                    }
                }

                $questionType = Question::where('id', array_key_first($request->questions))->value('question_type');
                if ($questionType === 'DASS21') {
                    $depressionScore *= 2;
                    $anxietyScore *= 2;
                    $stressScore *= 2;
                }

                $clientScore = new ClientScore([
                    'profile_id' => $user->profile->id,
                    'question_team_id' => $request->questionTeamId,
                    'question_type' => $questionType,
                    'depression_score' => $depressionScore,
                    'anxiety_score' => $anxietyScore,
                    'stress_score' => $stressScore
                ]);
                $clientScore->save();

                $finalScore = [
                    'depressionScore' => $depressionScore,
                    'anxietyScore' => $anxietyScore,
                    'stressScore' => $stressScore
                ];

                return response()->json([
                    'data' => $finalScore,
                    'message' => 'Data stored successfully',
                ]);
            } else {
                throw ValidationException::withMessages([ 'user_type' => ['User is not client, rejecting.']]);
            }
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Storing data failed, server error'
            ], 500);
        }
    }
}
