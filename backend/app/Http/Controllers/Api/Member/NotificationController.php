<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->paginate(20);

        return $this->success([
            'items' => NotificationResource::collection($notifications->items()),
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success(null, 'Notification marquée comme lue.');
    }

    /**
     * Compteur léger utilisé pour le badge "Notifications" du menu — évite de
     * recharger toute la liste paginée juste pour afficher un nombre.
     */
    public function unreadCount(Request $request)
    {
        return $this->success(['unread_count' => $request->user()->unreadNotifications()->count()]);
    }
}
