<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PHPUnit\Exception;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse {
        try {
            $request->validate([ 
                'name' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|string|min:8',
                'userType' => 'in:cli,psy'
            ]);

            // Check if there's any existing email
            $existingEmail = User::where('email', $request->email)->first();
            if ($existingEmail) {
                throw ValidationException::withMessages([ 'email' => ['Email is already existing']]);
            }

            $hashedPassword = Hash::make($request->password);

            $user = new User([
                'email' => $request->email,
                'password' => $hashedPassword
            ]);
            $user->save();

            $role = Role::where('slug', $request->userType)->firstOrFail();
            $roleId = $role->id;

            $profile = new Profile([ 
                'user_id' => $user->id,
                'role_id' => $roleId,
                'name' => $request->name
            ]);
            $profile->save();

            return response()->json([
                'data' => null,
                'message' => 'Registration successful',
            ]);
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Registration failed, server error'
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);
            $credentials = $request->only('email', 'password');

            if (Auth::attempt($credentials)) {
                $request->session()->regenerate();

                return response()->json([
                    'data' => null,
                    'message' => 'Authentication successful',
                ]);
            } else {
                return response()->json([
                    'data' => null,
                    'message' => 'Authentication failed, invalid crendentials',
                ], 401);
            }
        } catch (Exception $error) {
            return response()->json([
                'data' => $error,
                'message' => 'Authentication failed, server error'
            ], 500);
        }

    }

    public function logout(Request $request): JsonResponse {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'data' => null,
            'message' => 'Logged out successfully'
        ]);
    }

    public function showAuthInfo(): JsonResponse {
        $user = Auth::user();

        if($user){
            $profile = $user->profile;
            $role = $profile ? $profile->role : null;

            return response()->json([
                'data' => [
                    'userId' => $user->id,
                    'userName' => $profile->name,
                    'userRole' => $role->name,
                    'userSlug' => $role->slug
                ],
                'message' => 'User info loaded successfully',
            ]);
        } else {
            return response()->json([
                'data' => [
                    'userSlug' => 'guest'
                ],
                'message' => 'User is not logged in',
            ]);
        }
    }
}
