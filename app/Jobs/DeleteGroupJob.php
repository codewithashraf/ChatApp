<?php

namespace App\Jobs;

use App\Events\DeleteGroupEvent;
use App\Models\Group;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DeleteGroupJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Group $group)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $id = $this->group->id;
        $name = $this->group->name;
        $group = $this->group;
        
        // set the last message to null
        $this->group->last_message_id = null;
        $this->group->save();
        
        $this->group->messages->each->delete();
        
        $this->group->users()->detach();
        
        $this->group->delete();

        DeleteGroupEvent::dispatch($id, $name, $group);
    }
}
