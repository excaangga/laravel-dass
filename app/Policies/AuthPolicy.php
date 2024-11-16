<?php

namespace App\Policies;

use App\Models\User;

class AuthPolicy
{
    /**
     * Determine whether the user is logged in.
     */
    public function isAuthenticated(?User $user): bool
    {
        return $user !== null;
    }
}
