<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\AdminNotification;

class XenditWebhookController extends Controller
{
    public function __construct(private XenditService $xendit) {}

    public function handle(Request $request): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token');
        if (! $this->xendit->verifyCallbackToken($callbackToken ?? '')) {
            Log::warning('Xendit webhook: token tidak valid', [
                'received' => $callbackToken,
                'ip'       => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $payload      = $request->all();
            $xenditStatus = strtoupper($payload['status'] ?? '');
            $invoiceId    = $payload['id'] ?? null;
            $externalId   = $payload['external_id'] ?? null;

            Log::info('Xendit webhook diterima', [
                'invoice_id'  => $invoiceId,
                'external_id' => $externalId,
                'status'      => $xenditStatus,
            ]);

            if (! $invoiceId) {
                Log::warning('Xendit webhook: payload tidak memiliki invoice id');
                return response()->json(['message' => 'OK'], 200);
            }

            $pesanan = Pesanan::where('xendit_invoice_id', $invoiceId)->first();

            if (! $pesanan && $externalId) {
                if (preg_match('/^DAPOER-(\d+)-\d+$/', $externalId, $matches)) {
                    $pesanan = Pesanan::find((int) $matches[1]);
                }
            }

            if (! $pesanan) {
                Log::warning('Xendit webhook: pesanan tidak ditemukan', [
                    'invoice_id'  => $invoiceId,
                    'external_id' => $externalId,
                ]);
                return response()->json(['message' => 'OK'], 200);
            }

            if ($pesanan->xendit_status === 'PAID') {
                return response()->json(['message' => 'OK'], 200);
            }

            DB::transaction(function () use ($pesanan, $xenditStatus, $payload) {
                $update = [
                    'xendit_status'         => $xenditStatus,
                    'xendit_payment_method' => $payload['payment_method'] ?? null,
                ];

                if ($xenditStatus === 'PAID') {
                    $update['status']  = 'diproses';
                    $update['paid_at'] = now();
                } elseif ($xenditStatus === 'EXPIRED') {
                    foreach ($pesanan->details as $detail) {
                        $detail->produk?->increment('stok', $detail->jumlah);
                    }
                    $update['status'] = 'dibatalkan';
                }

                $pesanan->update($update);

                if ($xenditStatus === 'PAID') {
                    AdminNotification::createForOrder($pesanan, 'payment_success');
                } elseif ($xenditStatus === 'EXPIRED') {
                    AdminNotification::createForOrder($pesanan, 'order_cancelled');
                }
            });

            Log::info('Xendit webhook: pesanan diperbarui', [
                'pesanan_id'    => $pesanan->id,
                'xendit_status' => $xenditStatus,
            ]);

            return response()->json(['message' => 'OK'], 200);

        } catch (\Throwable $e) {
            Log::error('Xendit webhook: exception tidak tertangani', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'OK'], 200);
        }
    }
}
