<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupUsers extends Model
{
    use HasFactory;

    public $guarded = false;

    public function lastReadMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_read_id');
    }

    public static function updateLastMessageReadId($message, $group_id, $user_id){
        return self::where('group_id', $group_id)
                    ->where('user_id', $user_id)
                    ->update([
                        'last_message_read_id' => $message->id,
                    ]);
    }
}
