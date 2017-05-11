<?php

namespace PascaleBeier\MaengelMelder\Installer\Request;

use Illuminate\Foundation\Http\FormRequest;
use App\Classes\Reply;

class CoreRequest extends FormRequest
{

    protected function formatErrors(\Illuminate\Contracts\Validation\Validator $validator)
    {
        return Reply::formErrors($validator);
    }

}