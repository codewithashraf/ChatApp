<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'sender' => $this->sender ? new UserResource($this->sender) : null,
            'group_id' => $this->group_id,
            'is_read' => $this->is_read,
            'attachments' => $this->attachments ? MessageAttachmentResource::collection($this->attachments) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // 'all_data' => $this,
        ];
    }
}
