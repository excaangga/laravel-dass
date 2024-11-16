<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Exception;

class QuestionController extends Controller
{
    public function index(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'questionType' => 'in:DASS21,DASS42',
            ]);

            $data = Question::where('question_type', $request->questionType)->get();

            return response()->json([
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
}
