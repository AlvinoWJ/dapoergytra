<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Xendit Secret Key
    |--------------------------------------------------------------------------
    | Dapatkan dari https://dashboard.xendit.co/settings/developers#api-keys
    | Untuk sandbox, gunakan key yang diawali "xnd_development_"
    */
    'secret_key' => env('XENDIT_SECRET_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Xendit Webhook Token
    |--------------------------------------------------------------------------
    | Callback Verification Token dari Xendit Dashboard > Webhooks
    */
    'webhook_token' => env('XENDIT_WEBHOOK_TOKEN', ''),

    /*
    |--------------------------------------------------------------------------
    | Redirect URLs setelah pembayaran
    |--------------------------------------------------------------------------
    */
    'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL', env('FRONTEND_URL', 'http://localhost:3000') . '/orders'),
    'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL', env('FRONTEND_URL', 'http://localhost:3000') . '/orders'),
];
