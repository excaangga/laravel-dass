<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionTeam extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'method_type'
    ];

    public function questionTeamMembers(): HasMany {
        return $this->hasMany(QuestionTeamMember::class);
    }

    public function owaWeights(): HasMany {
        return $this->hasMany(OWAWeight::class);
    }

    public function clientScores(): HasMany {
        return $this->hasMany(ClientScore::class);
    }
}
