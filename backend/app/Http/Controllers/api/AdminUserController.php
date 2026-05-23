<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/users
     * Daftar semua pelanggan (role = customer) untuk panel admin.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::where('role', 'customer')
            ->latest('created_at')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $users,
            'total'   => User::where('role', 'customer')->count(),
        ]);
    }
}
