<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        // ek or method observer ko call karnay kai liye hota hai 
        // Message::observe(MessageObserver::class);

        Vite::prefetch(concurrency: 3);
        if(config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
