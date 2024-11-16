<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionTeamMember extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'profile_id',
        'question_team_id',
    ];

    public function profile(): BelongsTo {
        return $this->belongsTo(Profile::class);
    }

    public function questionTeam(): BelongsTo {
        return $this->belongsTo(QuestionTeam::class);
    }

    public function questionScores(): HasMany {
        return $this->hasMany(QuestionScore::class);
    }
}
