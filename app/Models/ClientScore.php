<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientScore extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'profile_id',
        'question_team_id',
        'depression_score',
        'anxiety_score',
        'stress_score',
        'question_type'
    ];

    public function profile(): BelongsTo {
        return $this->belongsTo(Profile::class);
    }

    public function questionTeam(): BelongsTo {
        return $this->belongsTo(QuestionTeam::class);
    }
}
