<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('online', function(User $user){
    return $user ? new UserResource($user) : null;
});

Broadcast::channel('message.user.{user_id1}-{user_id2}', function(User $user, int $userId1, int $userId2)
{
    return $user->id === $userId1 || $user->id === $userId2 ? $user : null;
});

Broadcast::channel('message.group.{groupId}', function(User $user, int $groupId)
{
    return $user->groups->contains('id', $groupId) ? $user : null;
});
