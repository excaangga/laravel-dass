<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\ClientScore;
use App\Models\QuestionTeam;
use DateTime;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Auth;

class ReportingController extends Controller
{
    public function index(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'page' => 'integer|nullable'
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'cli') {
                $clientScores = ClientScore::where('profile_id', $user->profile->id)
                    ->orderBy('created_at', 'desc')
                    ->paginate(10);

                $data = [];
                foreach ($clientScores as $score) {
                    $questionTeam = QuestionTeam::where('id', $score->question_team_id)->first();
                    $formattedDate = new DateTime($score->created_at);
                    $formattedDate->setTimezone(new DateTimeZone('Asia/Jakarta'));
                    $formattedDate = $formattedDate->format('d-m-Y H:i');
                    $data[] = [
                        'createdAt' => $formattedDate,
                        'questionTeam' => $questionTeam->name . ' - ' . $questionTeam->method_type,
                        'questionType' => $score->question_type,
                        'depressionScore' => $score->depression_score,
                        'anxietyScore' => $score->anxiety_score,
                        'stressScore' => $score->stress_score,
                    ];
                }

                return response()->json([
                    'data' => $data,
                    'pagination' => [
                        'currentPage' => $clientScores->currentPage(),
                        'lastPage' => $clientScores->lastPage(),
                        'total' => $clientScores->total(),
                        'perPage' => $clientScores->perPage(),
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
}
