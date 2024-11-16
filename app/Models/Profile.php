<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'user_id',
        'role_id'
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    } 

    public function role(): BelongsTo {
        return $this->belongsTo(Role::class);
    } 

    public function questionTeamMembers(): HasMany {
        return $this->hasMany(QuestionTeamMember::class);
    }

    public function clientScores(): HasMany {
        return $this->hasMany(ClientScore::class);
    }
}
