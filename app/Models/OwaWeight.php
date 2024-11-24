<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwaWeight extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question_team_id',
        'question_id',
        'depression_weight',
        'anxiety_weight',
        'stress_weight'
    ];

    public function questionTeam(): BelongsTo {
        return $this->belongsTo(QuestionTeam::class);
    }

    public function question(): BelongsTo {
        return $this->belongsTo(Question::class);
    }
}
