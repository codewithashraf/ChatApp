<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

use function PHPSTORM_META\map;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'avatar', 
        'password',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function groups(){
        return $this->belongsToMany(Group::class, 'group_users');
    }

    public static function testkailiyehai(){
        $user = User::find(1);
        return (
            User::select('users.*', 'conversations.user_id2', 'messages.message as last_message', 'messages.created_at as last_message_data')
            ->where('users.id', '!=', $user->id)
            ->when( !$user->is_admin, function($query){
                $query->whereNull('users.blocked_at');
            })
            ->join('conversations', function($join) use ($user) {
                $join->on('conversations.user_id1', '=', $user->id)
                    ->where('conversations.user_id2', '=', 'users.id');
            })
            // ->leftJoin('conversations', function($join) use ($user) {
            //     $join->on('conversations.user_id1', '=', 'users.id')
            //          ->where('conversations.user_id2', '=', $user->id);
            // })
            ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->get()
        );
    }

    public static function getUsersExceptUser(User $user)
    {   
        $userId = $user->id;
        $query = User::select(['users.*', 'conversations.user_id1', 'conversations.user_id2', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->where('users.id', '!=', $userId)
            ->when(!$user->is_admin, function ($query) {
                $query->whereNull('users.blocked_at');
            })
            ->leftJoin('conversations', function($join) use ($userId){
                $join->on('conversations.user_id1', '=', 'users.id')
                    ->where('conversations.user_id2', '=', $userId)
                    ->orWhere(function ($query) use ($userId) {
                        $query->on('conversations.user_id2', '=', 'users.id')
                              ->where('conversations.user_id1', '=', $userId);
                    });
            })
            ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->orderByRaw('IFNULL(users.blocked_at, 1)')
            ->orderBy('messages.created_at', 'desc')
            ->orderBy('users.name');


            // return $query->toSql();
            return $query->get();

            // $allData = $query->get();
            // return $allData->map(function($user){
            //     return $user->toConversationArray();
            // });
    }

    public function toConversationArray()
    {
        return [
            'id' => $this->id,
            'avatar_url' => $this->avatar ? Storage::url($this->avatar) : null,
            'name' => $this->name,
            'is_group' => false,
            'is_user' => true,
            'is_admin' => (bool) $this->is_admin,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'blocked_at' => $this->blocked_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date ? $this->last_message_date . ' UTC' : null
        ];
    }
}
