<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\GroupUsers;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use FFMpeg\FFMpeg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function byUser(User $user)
    {
        // return $user->toConversationArray(); check karnay kai liye hai conversation array kya kaam kar rha hai 

        $messages = Message::where('sender_id', auth()->id())
            ->where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->where('receiver_id', auth()->id())
            ->latest()
            ->paginate(20);
        // return MessageResource::collection($messages);
        return inertia('Home', [
            'selectedConversation' => $user->toConversationArray(),
            'message' => MessageResource::collection($messages),
        ]);
    }

    public function byGroup(Group $group)
    {
        $userId = auth()->id();

        $groupUser = GroupUsers::where('group_id', $group->id)
            ->where('user_id', $userId)
            ->first();

        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(20);

        //    return MessageResource::collection($messages);


        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'message' => MessageResource::collection($messages),
            'last_message_read_id' => (int) $groupUser->last_message_read_id,
        ]);
    }

    public function loadOlder(Message $message)
    {
        if ($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(15);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id)
                        ->orWhere('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })
                ->latest()
                ->paginate(15);
        }

        return MessageResource::collection($messages);
    }

    // public function store(StoreMessageRequest $request)
    // {
    //     $data = $request->validated();
    //     $data['sender_id'] = auth()->id();
    //     $receiver_id = $data['receiver_id'] ?? null;
    //     $group_id = $data['group_id'] ?? null;
    //     $files = $request->file('attachments') ?? null;

    //     // Create the message
    //     $message = Message::create($data);

    //     $attachments = [];
    //     if ($files) {
    //         foreach ($files as $file) {
    //             $directory = 'attachments/' . Str::random(32);
    //             Storage::makeDirectory($directory);

    //             // Check if the file is an .ogg file
    //             if ($file->getClientOriginalExtension() === 'ogg' || $file->getClientOriginalExtension() === 'webm') {
    //                 // Convert .ogg to .mp3
    //                 $inputPath = $file->getRealPath();
    //                 $outputPath = storage_path('app/public/' . $directory . '/converted_audio.mp3');

    //                 // Convert using FFmpeg
    //                 $ffmpeg = FFMpeg::create([
    //                     'ffmpeg.binaries'  => '/path/to/ffmpeg',
    //                     'ffprobe.binaries' => '/path/to/ffprobe',
    //                 ]); // Create FFMpeg instance
    //                 $audio = $ffmpeg->open($inputPath); // Open the file
    //                 $audio->save(new \FFMpeg\Format\Audio\Mp3(), $outputPath); // Save the converted file as mp3

    //                 // Use the same directory for saving the converted mp3 file
    //                 $filePath = 'attachments/' . Str::random(32) . '/converted_audio.mp3';  // Save it in the same directory

    //                 $model = [
    //                     'message_id' => $message->id,
    //                     'name' => 'converted_audio.mp3', // Set to mp3 name
    //                     'mime' => 'audio/mpeg', // Set MIME type to mp3
    //                     'size' => filesize($outputPath), // Get the size of the converted file
    //                     'path' => $filePath,
    //                 ];
    //             } else {
    //                 // If not .ogg, store it as is
    //                 $model = [
    //                     'message_id' => $message->id,
    //                     'name' => $file->getClientOriginalName(),
    //                     'mime' => $file->getClientMimeType(),
    //                     'size' => $file->getSize(),
    //                     'path' => $file->store($directory, 'public'),
    //                 ];
    //             }

    //             $attachment = MessageAttachment::create($model);
    //             $attachments[] = $attachment;
    //         }

    //         $message->attachments = $attachments;
    //     }

    //     if ($receiver_id) {
    //         Conversation::updateConversationWithMessage($receiver_id, auth()->id(), $message);
    //     }

    //     if ($group_id) {
    //         Group::updateGroupWithMessage($group_id, $message);
    //     }

    //     SocketMessage::dispatch($message);

    //     return new MessageResource($message);
    // }


    public function store(StoreMessageRequest $request)
    {


        $data = $request->validated();
        $data['sender_id'] = auth()->id();
        $receiver_id = $data['receiver_id'] ?? null;
        $group_id = $data['group_id'] ?? null;
        $files = $data['attachments'] ?? null;

        if ($files === null && $data['message'] === null) {
            return response()->json(['message' => 'message and attachments are null'], 404);
        }

        $message = $message = Message::create($data);

        $attachments = [];
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);

                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory, 'public'),
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments = $attachments;
        }

        if ($receiver_id) {
            Conversation::updateConversationWithMessage($receiver_id, auth()->id(), $message);
        }

        if ($group_id) {
            Group::updateGroupWithMessage($group_id, $message);
        }

        SocketMessage::dispatch($message);

        return new MessageResource($message);
    }

    public function destroy(Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message', 'forbidden'], 403);
        }

        $message->delete();

        $lastMessage = null;

        if ($message->group_id) {
            $group = Group::find($message->group_id);
            $lastMessage = $group->lastMessage;
            // dd($lastMessage);
        } else {
            $conversation = Conversation::where('user_id1', $message->sender_id)
                ->where('user_id2', $message->receiver_id)
                ->orWhere('user_id1', $message->receiver_id)
                ->where('user_id2', $message->sender_id)
                ->first();
            $lastMessage = $conversation->lastMessage;
            // dd($lastMessage);
        }

        SocketMessage::dispatch($message, $lastMessage, true);

        return response()->json(['message' => $lastMessage ? new MessageResource($lastMessage) : null]);
    }



    public function updateReadColumn(Request $request)
    {
        // $message = Message::where('is_read', '=', 0)->update([
        //     'is_read' => true,
        // ]);

        $message = Message::where('conversation_id', '=', $request->conversation_id)
            ->where('receiver_id', '=', $request->receiver_id)
            ->where('is_read', '=', 0)
            ->update([
                'is_read' => 1,
            ]);

        // dd($message);
        return $message;
    }

    public function updateLastMessageReadIdForGroupUser(Request $request)
    {
        $data = GroupUsers::where('group_id', $request->group_id)
            ->where('user_id', $request->user_id)
            ->update([
                'last_message_read_id' => $request->last_message_id,
            ]);
        return $data;
    }
}
