<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\QuestionScore;
use App\Models\QuestionTeamMember;
use DateTime;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Exception;

class ScoringController extends Controller
{
    public function index(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'questionTeamId' => 'required|integer',
                'page' => 'integer|nullable'
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeamMembers = QuestionTeamMember::where('question_team_id', $request->questionTeamId)
                    ->with('profile')
                    ->orderBy('created_at', 'desc')
                    ->paginate(10);

                $data = [];
                foreach ($questionTeamMembers as $member) {
                    $questionScore = QuestionScore::where('question_team_member_id', $member->id)->first();
                    $userQuestionScore = QuestionScore::wherehas('questionTeamMember', function ($query) use ($user, $request) {
                        $query->where('profile_id', $user->profile->id)
                            ->where('question_team_id', $request->questionTeamId);
                    })->first();

                    $formattedDate = $questionScore ? new DateTime($questionScore->created_at) : '-';
                    if ($questionScore) {
                        $formattedDate->setTimezone(new DateTimeZone('Asia/Jakarta'));
                        $formattedDate = $formattedDate->format('d-m-Y');
                    }

                    $data[] = [
                        'createdAt' => $formattedDate,
                        'teamMember' => $member->profile->name,
                        'hasSubmittedScoring' => !!$questionScore,
                        'userHasScored' => !!$userQuestionScore
                    ];
                }

                return response()->json([
                    'data' => $data,
                    'pagination' => [
                        'currentPage' => $questionTeamMembers->currentPage(),
                        'lastPage' => $questionTeamMembers->lastPage(),
                        'total' => $questionTeamMembers->total(),
                        'perPage' => $questionTeamMembers->perPage(),
                    ],
                    'message' => 'Index successful',
                ]);
            }
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Index failed, server error'
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse {
        try {
            $request->validate([
                'questions' => 'required',
                'questionTeamId' => 'required|integer'
            ]);

            foreach ($request->questions as $questionId => $scores) {
                Validator::validate([
                    'questionId' => $questionId,
                    'depressionScore' => $scores['depressionScore'],
                    'anxietyScore' => $scores['anxietyScore'],
                    'stressScore' => $scores['stressScore'],
                ], [
                    'questionId' => 'required|integer',
                    'depressionScore' => 'required|integer|min:1|max:3',
                    'anxietyScore' => 'required|integer|min:1|max:3',
                    'stressScore' => 'required|integer|min:1|max:3',
                ]);
            }

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeamMember = QuestionTeamMember::where('profile_id', $user->profile->id)
                    ->where('question_team_id', $request->questionTeamId)
                    ->first();

                foreach ($request->questions as $questionId => $scores) {
                    $questionScore = new QuestionScore([
                        'question_team_member_id' => $questionTeamMember->id,
                        'question_id' => $questionId,
                        'depression_score' => $scores['depressionScore'],
                        'anxiety_score' => $scores['anxietyScore'],
                        'stress_score' => $scores['stressScore'],
                    ]);
                    $questionScore->save();
                }

                return response()->json([
                    'data' => null,
                    'message' => 'Data stored successfully',
                ]);
            }
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Data is not stored, server error'
            ], 500);
        }
    }
}
