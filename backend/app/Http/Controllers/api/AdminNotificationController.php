<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    /**
     * GET /api/admin/notifications
     * Daftar notifikasi terbaru (maks. 50).
     */
    public function index(Request $request): JsonResponse
    {
        $limit         = min((int) $request->input('limit', 25), 50);
        $notifications = AdminNotification::latest()
            ->limit($limit)
            ->get()
            ->map(fn ($n) => $this->format($n));

        $unreadCount = AdminNotification::where('is_read', false)->count();

        return response()->json([
            'success'      => true,
            'data'         => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * GET /api/admin/notifications/unread-count
     */
    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'count' => AdminNotification::where('is_read', false)->count(),
            ],
        ]);
    }

    /**
     * PATCH /api/admin/notifications/{id}/read
     */
    public function markRead(int $id): JsonResponse
    {
        $notification = AdminNotification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai sudah dibaca.',
            'data'    => $this->format($notification),
        ]);
    }

    /**
     * PATCH /api/admin/notifications/read-all
     */
    public function markAllRead(): JsonResponse
    {
        AdminNotification::where('is_read', false)->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
        ]);
    }

    private function format(AdminNotification $n): array
    {
        return [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'message'    => $n->message,
            'order_id'   => $n->order_id,
            'is_read'    => $n->is_read,
            'created_at' => $n->created_at,
        ];
    }
}
