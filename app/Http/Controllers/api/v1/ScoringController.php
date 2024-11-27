<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\OwaWeight;
use App\Models\Question;
use App\Models\QuestionScore;
use App\Models\QuestionTeam;
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

                // reject team with uncomplete scoring
                $unpaginatedQuestionTeamMembers = QuestionTeamMember::where('question_team_id', $request->questionTeamId)
                    ->with('profile')
                    ->orderBy('created_at', 'desc')
                    ->get();
                $memberExistsWithNoDass21Score = false;
                $memberExistsWithNoDass42Score = false;
                foreach ($unpaginatedQuestionTeamMembers as $member) {
                    $userQuestionDass21Score = QuestionScore::wherehas('questionTeamMember', function ($query) use ($member, $request) {
                        $query->where('profile_id', $member->profile_id)
                            ->where('question_team_id', $request->questionTeamId);
                        })
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS21');
                        })
                        ->first();
                    $userQuestionDass42Score = QuestionScore::wherehas('questionTeamMember', function ($query) use ($member, $request) {
                        $query->where('profile_id', $member->profile_id)
                            ->where('question_team_id', $request->questionTeamId);
                        })
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS42');
                        })
                        ->first();

                    $memberExistsWithNoDass21Score = !!$userQuestionDass21Score;
                    $memberExistsWithNoDass42Score = !!$userQuestionDass42Score;
                }

                // main data mapping
                $data = [];
                foreach ($questionTeamMembers as $member) {
                    $dass21QuestionScore = QuestionScore::where('question_team_member_id', $member->id)
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS21');
                        })
                        ->first();
                    $dass42QuestionScore = QuestionScore::where('question_team_member_id', $member->id)
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS42');
                        })
                        ->first();

                    // check current user scoring status
                    $userQuestionDass21Score = QuestionScore::wherehas('questionTeamMember', function ($query) use ($user, $request) {
                        $query->where('profile_id', $user->profile->id)
                            ->where('question_team_id', $request->questionTeamId);
                        })
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS21');
                        })
                        ->first();
                    $userQuestionDass42Score = QuestionScore::wherehas('questionTeamMember', function ($query) use ($user, $request) {
                        $query->where('profile_id', $user->profile->id)
                            ->where('question_team_id', $request->questionTeamId);
                        })
                        ->wherehas('question', function ($query) {
                            $query->where('question_type', 'DASS42');
                        })
                        ->first();

                    $formattedDateDass21 = $dass21QuestionScore ? new DateTime($dass21QuestionScore->created_at) : '-';
                    if ($dass21QuestionScore) {
                        $formattedDateDass21->setTimezone(new DateTimeZone('Asia/Jakarta'));
                        $formattedDateDass21 = $formattedDateDass21->format('d-m-Y');
                    }

                    $formattedDateDass42 = $dass42QuestionScore ? new DateTime($dass42QuestionScore->created_at) : '-';
                    if ($dass42QuestionScore) {
                        $formattedDateDass42->setTimezone(new DateTimeZone('Asia/Jakarta'));
                        $formattedDateDass42 = $formattedDateDass42->format('d-m-Y');
                    }

                    $data[] = [
                        'teamMember' => $member->profile->name,
                        'dass21CreatedAt' => $formattedDateDass21,
                        'dass42CreatedAt' => $formattedDateDass42,
                        'userHasScoredDass21' => !!$userQuestionDass21Score,
                        'userHasScoredDass42' => !!$userQuestionDass42Score,
                        'memberExistsWithNoDass21Score' => $memberExistsWithNoDass21Score,
                        'memberExistsWithNoDass42Score' => $memberExistsWithNoDass42Score,
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

    public function publish(Request $request): JsonResponse {
        try {
            $request->validate([
                'questionTeamId' => 'required|integer'
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeamMembers = QuestionTeamMember::where('question_team_id', $request->questionTeamId)
                    ->with('profile')
                    ->get();
                $totalMember = count($questionTeamMembers);

                $fuzzyPreferenceRelations = [];
                foreach ($questionTeamMembers as $memberIndex => $member) {
                    $questions = QuestionScore::where('question_team_member_id', $member->id)->get();
                    $fuzzyPreferenceRelations[$memberIndex] = [
                        [
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0]
                        ],
                    ];
                    foreach ($questions as $questionIndex => $question) {
                        $score = QuestionScore::where('question_team_member_id', $member->id)->where('question_id', $question->question_id)->first();
                        // order used: [depression, anxiety, stress]
                        $mappedScore = [$score->depression_score, $score->anxiety_score, $score->stress_score];
                        for ($i=0; $i<count($mappedScore); $i++) {
                            for ($j=0; $j<count($mappedScore); $j++) {
                                if (!isset($fuzzyPreferenceRelations[$memberIndex][$questionIndex][$i][$j])) {
                                    $fuzzyPreferenceRelations[$memberIndex][$questionIndex][$i][$j] = 0;
                                }
                                $fuzzyPreferenceRelations[$memberIndex][$questionIndex][$i][$j] = 0.5 * (1 + ($mappedScore[$j] / (count($mappedScore) - 1)) - ($mappedScore[$i] / (count($mappedScore) - 1)));
                            }
                        }
                    }
                }

                // k acts as questionIndex iterator
                $weights = [];
                for ($k=0; $k<count($fuzzyPreferenceRelations[0]); $k++) {
                    for ($i=0; $i<$totalMember; $i++) {
                        if (!isset($weights[$k][$i])) {
                            $weights[$k][$i] = 0;
                        }
                        $weights[$k][$i] = sqrt(($i+1) / $totalMember) - sqrt((($i+1) - 1) / $totalMember);
                    }
                }

                $sortedFuzzyPreferenceRelations = [];
                foreach ($fuzzyPreferenceRelations as $memberIndex => $member) {
                    foreach ($member as $questionIndex => $question) {
                        $sortedMatrix = [];
                        for ($i=0; $i<3; $i++) {
                            $row = [];
                            for ($j=0; $j<3; $j++) {
                                $row[] = $question[$i][$j];
                            }
                            rsort($row);
                            $sortedMatrix[] = $row;
                        }
                        $sortedFuzzyPreferenceRelations[$memberIndex][$questionIndex] = $sortedMatrix;
                    }
                }

                $aggregatedFuzzyPreferenceRelations = [];
                foreach ($sortedFuzzyPreferenceRelations as $memberIndex => $member) {
                    foreach ($member as $questionIndex => $question) {
                        for ($i=0; $i<3; $i++) {
                            for ($j=0; $j<3; $j++) {
                                if (!isset($aggregatedFuzzyPreferenceRelations[$questionIndex][$i][$j])) {
                                    $aggregatedFuzzyPreferenceRelations[$questionIndex][$i][$j] = 0;
                                }
                                $aggregatedFuzzyPreferenceRelations[$questionIndex][$i][$j] += $weights[$questionIndex][$memberIndex] * $sortedFuzzyPreferenceRelations[$memberIndex][$questionIndex][$i][$j];
                            }
                        }
                    }
                }

                // k acts as questionIndex iterator
                $sortedAggregatedFuzzyPreferenceRelations = [];
                for ($k=0; $k<count($aggregatedFuzzyPreferenceRelations); $k++) {
                    for ($i=0; $i<3; $i++) {
                        $row = [];
                        for ($j=0; $j<3; $j++) {
                            $row[$k][] = $aggregatedFuzzyPreferenceRelations[$k][$i][$j];
                        }
                        rsort($row[$k]);
                        $sortedAggregatedFuzzyPreferenceRelations[$k][] = $row[$k];
                    }
                }

                // the other 'weights' is for members, this one is for params.
                // e.g. depression, anxiety, and stress
                // ====================================
                // k acts as questionIndex iterator
                $paramWeights = [];
                for ($k=0; $k<count($sortedAggregatedFuzzyPreferenceRelations); $k++) {
                    for ($i=0; $i<3; $i++) {
                        $paramWeights[$k][$i] = sqrt(($i+1) / 3) - sqrt((($i+1) - 1) / 3);
                    }
                }

                // QGDD
                // k acts as questionIndex iterator
                $qgdd = [];
                for ($k=0; $k<count($paramWeights); $k++) {
                    for ($i=0; $i<3; $i++) {
                        for ($j=0; $j<3; $j++) {
                            if (!isset($qgdd[$k][$i])) {
                                $qgdd[$k][$i] = 0;
                            }
                            $qgdd[$k][$i] += $paramWeights[$k][$i] * $sortedAggregatedFuzzyPreferenceRelations[$k][$i][$j];
                        }
                    }
                }

                // normalize
                // k acts as questionIndex iterator
                // i acts as params index, e.g. [depression, anxiety, stress]
                $normalizedResult = [];
                for ($k=0; $k<count($qgdd); $k++) {
                    for ($i=0; $i<3; $i++) {
                        $normalizedResult[$k][$i] = $qgdd[$k][$i] / array_sum($qgdd[$k]);
                    }
                }

                $allQuestions = Question::all();
                foreach ($allQuestions as $questionIndex => $question) {
                    $owaWeight = new OwaWeight([
                        'question_team_id' => $request->questionTeamId,
                        'question_id' => $question->id,
                        'depression_weight' => $normalizedResult[$questionIndex][0],
                        'anxiety_weight' => $normalizedResult[$questionIndex][1],
                        'stress_weight' => $normalizedResult[$questionIndex][2]
                    ]);
                    $owaWeight->save();
                }

                $questionTeam = QuestionTeam::where('id', $request->questionTeamId)->first();
                $questionTeam->is_published = true;
                $questionTeam->save();

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
