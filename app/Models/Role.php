<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['slug', 'name'];

    public function profiles(): HasMany {
        return $this->hasMany(Profile::class);
    }
}
