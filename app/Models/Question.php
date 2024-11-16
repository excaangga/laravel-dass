<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question',
        'question_type'
    ];

    public function owaWeights(): HasMany {
        return $this->hasMany(OWAWeight::class);
    }

    public function questionScores(): HasMany {
        return $this->hasMany(QuestionScore::class);
    }
}
