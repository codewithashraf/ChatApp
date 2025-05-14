<?php

namespace App\Http\Controllers;

use App\Events\CreateOrUpdateGroup;
use App\Events\DeleteGroupEvent;
use App\Events\SocketMessage;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Jobs\DeleteGroupJob;
use App\Models\Group;

class GroupController extends Controller
{
   
    public function store(StoreGroupRequest $request)
    {
        $data = $request->validated();  
        $user_ids = $data['user_ids'] ?? [];
        $group = Group::create($data);
        $group->users()->attach(array_unique([$request->user()->id, ...$user_ids]));

        return redirect()->back();
    }

  
//     public function update(UpdateGroupRequest $request, Group $group)
//     {
//         $data = $request->validated();  
//         $user_ids = $data['user_ids'] ?? [];
//         $group->update($data);

//         $group->users()->detach();
//         $group->users()->attach(array_unique([$request->user()->id, ...$user_ids]));
// dd($group->users()->id);
//         return redirect()->back();
//     }

public function update(UpdateGroupRequest $request, Group $group)
{
    $data = $request->validated();  
    $newUserIds = $data['user_ids'] ?? [];

    $ownerId = $group->owner_id;

    // 🟡 Purane user IDs (relation se), owner_id exclude karo
    $oldUserIds = $group->users()->pluck('users.id')->toArray();
    $oldUserIds = array_filter($oldUserIds, fn($id) => $id != $ownerId);

    // 🟢 New user IDs se bhi owner_id hatao
    $filteredNewUserIds = array_filter($newUserIds, fn($id) => $id != $ownerId);

    // 🔽 Removed users (purane the, ab nahi)
    $removedUsers = array_diff($oldUserIds, $filteredNewUserIds);

    // 🔼 Added users (ab hain, pehle nahi the)
    $addedUsers = array_diff($filteredNewUserIds, $oldUserIds);

    // 🛠 Group update
    $group->update($data);

    // 🧠 Attach owner + baaki users
    $group->users()->sync(array_unique([$ownerId, ...$filteredNewUserIds]));

    // ✅ Output check
    // dd([
    //     'added_users' => $addedUsers,
    //     'removed_users' => $removedUsers,
    // ]);

    CreateOrUpdateGroup::dispatch($group->id, $group, $addedUsers, $removedUsers);


    return redirect()->back();
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        if($group->owner_id !== auth()->id()){
            abort(403);
        }

        DeleteGroupJob::dispatch($group)->delay(now()->addSeconds(5));

        return response()->json(['message' => 'Group delete was scheduled and will be deleted soon']);
    }
}
