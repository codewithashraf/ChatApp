<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\Mime\MessageConverter;

Route::middleware(['auth', 'verified'])->group(function (){
    Route::get('/', [HomeController::class, 'home'])->name('dashboard');

    Route::get('user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destory');

    Route::get('message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');

    Route::post('/updateReadColumn', [MessageController::class, "updateReadColumn"])->name('update.is_read');

    Route::post('/updateReadMessageId', [MessageController::class, "updateLastMessageReadIdForGroupUser"])->name('update.read_message_id');

    //group crud routes
    Route::post('/group', [GroupController::class, 'store'])->name('group.store');
    Route::put('/group/{group}', [GroupController::class, 'update'])->name('group.update');
    Route::delete('/group/{group}', [GroupController::class, 'destroy'])->name('group.destroy');
});










// all routes are temporary

Route::get('/testing', function(){
    return Conversation::getConversationsForSidebar(User::find(1));
});
Route::get('/testingtwo', function(){
    return Message::byUser(User::find(2));
});

Route::get('phpInfo', function() {
    return phpinfo();
});

Route::get('/usertest/{user}', [MessageController::class, "byUser"]);

Route::get('/grouptest/{group}', [MessageController::class, "byGroup"]);
// Route::get('/testing2', function(){
//     $user = User::find(1);
//     return Group::getGroupsForUser($user);
//     // return User::testkailiyehai();
// });

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
