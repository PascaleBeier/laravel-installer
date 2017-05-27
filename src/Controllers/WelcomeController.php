<?php

namespace PascaleBeier\MaengelMelder\Installer\Controllers;

use Illuminate\Routing\Controller;

class WelcomeController extends Controller
{
    /**
     * Display the installer welcome page.
     *
     * @return \Illuminate\View\View
     */

    public function welcome()
    {
        return view('vendor.installer.welcome');
    }
}
