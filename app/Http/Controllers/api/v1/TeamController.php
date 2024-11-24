<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\QuestionTeam;
use App\Models\QuestionTeamMember;
use DateTime;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Exception;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'page' => 'integer|nullable'
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeams = QuestionTeam::whereHas('questionTeamMembers', function ($questionTeamMemberQuery) use ($user) {
                    $questionTeamMemberQuery->where('profile_id', $user->profile->id);
                })->orderBy('created_at', 'desc')->paginate(10);

                $data = [];
                foreach ($questionTeams as $team) {
                    $formattedDate = new DateTime($team->created_at);
                    $formattedDate->setTimezone(new DateTimeZone('Asia/Jakarta'));
                    $formattedDate = $formattedDate->format('d-m-Y');

                    $questionTeamMembers = QuestionTeamMember::where('question_team_id', $team->id)->with('profile')->get();
                    $memberNames = $questionTeamMembers->map(function ($member) {
                        return $member->profile->name;
                    })->toArray();

                    $data[] = [
                        'id' => $team->id,
                        'createdAt' => $formattedDate,
                        'questionTeam' => $team->name . ' - ' . $team->method_type,
                        'code' => $team->code,
                        'teamMembers' => implode(', ', $memberNames),
                        'isPublished' => $team->is_published
                    ];
                }

                return response()->json([
                    'data' => $data,
                    'pagination' => [
                        'currentPage' => $questionTeams->currentPage(),
                        'lastPage' => $questionTeams->lastPage(),
                        'total' => $questionTeams->total(),
                        'perPage' => $questionTeams->perPage(),
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
                'teamName' => 'required|string',
                'teamCode' => 'required|string|min:8',
                'methodType' => 'in:OWA,IOWA'
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeam = new QuestionTeam([
                    'name' => $request->teamName,
                    'code' => $request->teamCode,
                    'method_type' => $request->methodType,
                ]);
                $questionTeam->save();

                $questionTeamMember = new QuestionTeamMember([
                    'profile_id' => $user->profile->id,
                    'question_team_id' => $questionTeam->id
                ]);
                $questionTeamMember->save();

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

    public function joinTeam(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'teamCode' => 'required|string|min:8',
            ]);

            $user = Auth::user();
            if ($user->profile->role->slug === 'psy') {
                $questionTeam = QuestionTeam::where('code', $request->teamCode)->first();
                if (!$questionTeam) {
                    return response()->json([
                        'data' => null,
                        'message' => 'Invalid team code',
                    ], 400);
                }

                $isMember = QuestionTeamMember::where('profile_id', $user->profile->id)
                    ->where('question_team_id', $questionTeam->id)
                    ->exists();

                if ($isMember) {
                    return response()->json([
                        'data' => null,
                        'message' => 'You are already a member of this team',
                    ], 400);
                }

                $questionTeamMember = new QuestionTeamMember([
                    'profile_id' => $user->profile->id,
                    'question_team_id' => $questionTeam->id
                ]);
                $questionTeamMember->save();

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
