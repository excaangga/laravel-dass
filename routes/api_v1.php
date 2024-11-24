<?php

use App\Http\Controllers\api\v1\AuthController;
use App\Http\Controllers\api\v1\QuestionController;
use App\Http\Controllers\api\v1\ReportingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
|
| This file contains all of the v1 routes.
| This file is loaded and the routes are pre-pended automatically 
| by App\Providers\RouteServiceProvider->boot()
|
*/

Route::group([
    'middleware' => ['api_public'],
], function () {

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/show', [AuthController::class, 'showAuthInfo']);

    Route::post('/questionnaire', [QuestionController::class, 'index']);
    Route::post('/questionnaire/score', [QuestionController::class, 'calculateClientScore']);

    Route::post('/reporting', [ReportingController::class, 'index']);
});
