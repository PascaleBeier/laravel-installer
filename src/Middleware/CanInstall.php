<?php

namespace PascaleBeier\MaengelMelder\Installer\Middleware;

use Closure;
use DB;

/**
 * Class CanInstall
 * @package PascaleBeier\MaengelMelder\Installer\Middleware
 */
class CanInstall
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {

        if ($this->alreadyInstalled()) {
            abort(404);
        }
        
        return $next($request);
    }

    /**
     * If application is already installed.
     *
     * @return bool
     */
    public function alreadyInstalled()
    {
        return file_exists(storage_path('installed'));
    }
}
