<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::factory()->create([
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true,
            'email_verified_at' => Carbon::now(),
            'remember_token' => Str::random(10),
        ]);
        User::factory()->create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => Carbon::now(),
            'remember_token' => Str::random(10),
        ]);

        //besides two uesr I am gonna generate 10 fake users
        // User::factory(10)->create();

        // for($i = 0; $i < 5; $i++){
        //     $group = Group::factory()->create([
        //         'owner_id' => 1,
        //     ]);

        //     $users = User::inRandomOrder()->limit(rand(2, 5))->pluck('id');

        //     $group->users()->attach(array_unique([1, ...$users]));
        // }

        // Message::factory(1000)->create();
        // $messages = Message::whereNull('group_id')->orderBy('created_at')->get();

        // $conversations = $messages->groupBy(function ($message){
        //     return collect([$message->sender_id, $message->receiver_id])->sort()->implode('_');
        // })->map(function ($groupedMessages){
        //     return [
        //         'user_id1' => $groupedMessages->first()->sender_id,
        //         'user_id2' => $groupedMessages->first()->receiver_id,
        //         'last_message_id' => $groupedMessages->last()->id,
        //         'created_at' => new Carbon(),
        //         'updated_at' => new Carbon(),
        //     ];
        // })->values();

        // Conversation::insertOrIgnore($conversations->toArray());
    }
}
