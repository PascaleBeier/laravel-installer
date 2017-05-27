<?php

namespace PascaleBeier\MaengelMelder\Installer\Controllers;

use Illuminate\Routing\Controller;
use PascaleBeier\MaengelMelder\Installer\Helpers\EnvironmentManager;
use PascaleBeier\MaengelMelder\Installer\Request\UpdateRequest;

/**
 * Class EnvironmentController
 * @package Froiden\LaravelInstaller\Controllers
 */
class EnvironmentController extends Controller
{

    /**
     * @var EnvironmentManager
     */
    protected $environmentManager;

    /**
     * @param EnvironmentManager $environmentManager
     */
    public function __construct(EnvironmentManager $environmentManager)
    {
        $this->environmentManager = $environmentManager;
    }

    /**
     * Display the Environment page.
     *
     * @return \Illuminate\View\View
     */
    public function environment()
    {
        $envConfig = $this->environmentManager->getEnvContent();

        return view('vendor.installer.environment', compact('envConfig'));
    }

    /**
     * @param UpdateRequest $request
     * @return string
     */
    public function save(UpdateRequest $request)
    {

        $message = $this->environmentManager->saveFile($request);
        return $message;
    }
}
