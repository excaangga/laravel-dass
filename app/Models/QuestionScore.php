<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionScore extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question_team_member_id',
        'question_id',
        'depression_score',
        'anxiety_score',
        'stress_score',
    ];

    public function questionTeamMember(): BelongsTo {
        return $this->belongsTo(QuestionTeamMember::class);
    }

    public function question(): BelongsTo {
        return $this->belongsTo(Question::class);
    }
}
