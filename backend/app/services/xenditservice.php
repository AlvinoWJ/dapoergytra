<?php

namespace App\Services;

use App\Models\Pesanan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditService
{
    private string $secretKey;
    private string $baseUrl = 'https://api.xendit.co';

    public function __construct()
    {
        $this->secretKey = config('xendit.secret_key');
    }

    /**
     * Buat Invoice Xendit untuk pesanan.
     * Mengembalikan array ['invoice_id', 'invoice_url', 'expires_at'] atau throw exception.
     */
    public function createInvoice(Pesanan $pesanan): array
    {
        $externalId = 'DAPOER-' . $pesanan->id . '-' . time();

        $payload = [
            'external_id'      => $externalId,
            'amount'           => (int) $pesanan->total,
            'description'      => 'Pembayaran Dapoergytra #' . $pesanan->id,
            'invoice_duration' => 86400, // 24 jam dalam detik
            'currency'         => 'IDR',
            'customer'         => [
                'given_names'   => $pesanan->nama_penerima,
                'mobile_number' => $pesanan->no_hp,
            ],
            'customer_notification_preference' => [
                'invoice_created' => ['whatsapp', 'sms'],
                'invoice_paid'    => ['whatsapp', 'sms'],
            ],
            // Hanya aktifkan QRIS
            'payment_methods'  => ['QRIS'],
            'items'            => $this->buildItems($pesanan),
            'fees'             => [
                [
                    'type'  => 'Ongkos Kirim',
                    'value' => (int) $pesanan->ongkir,
                ],
            ],
            // Callback setelah bayar
            'success_redirect_url' => config('xendit.success_redirect_url') . '?order_id=' . $pesanan->id,
            'failure_redirect_url' => config('xendit.failure_redirect_url') . '?order_id=' . $pesanan->id,
        ];

        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout(30)
            ->post("{$this->baseUrl}/v2/invoices", $payload);

        if ($response->failed()) {
            Log::error('Xendit createInvoice gagal', [
                'pesanan_id' => $pesanan->id,
                'status'     => $response->status(),
                'body'       => $response->json(),
            ]);
            throw new \RuntimeException(
                'Gagal membuat invoice pembayaran: ' . ($response->json('message') ?? 'Unknown error')
            );
        }

        $data = $response->json();

        return [
            'invoice_id'  => $data['id'],
            'invoice_url' => $data['invoice_url'],
            'expires_at'  => $data['expiry_date'] ?? now()->addDay()->toISOString(),
        ];
    }

    /**
     * Verifikasi callback token dari Xendit webhook.
     */
    public function verifyCallbackToken(string $token): bool
    {
        return $token === config('xendit.webhook_token');
    }

    /**
     * Ambil detail invoice dari Xendit berdasarkan invoice_id.
     */
    public function getInvoice(string $invoiceId): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout(15)
            ->get("{$this->baseUrl}/v2/invoices/{$invoiceId}");

        if ($response->failed()) {
            throw new \RuntimeException('Gagal mengambil data invoice.');
        }

        return $response->json();
    }

    /**
     * Build items array untuk payload Xendit.
     */
    private function buildItems(Pesanan $pesanan): array
    {
        $pesanan->loadMissing('details.produk');

        return $pesanan->details->map(function ($detail) {
            return [
                'name'     => $detail->produk?->nama ?? 'Produk',
                'quantity' => (int) $detail->jumlah,
                'price'    => (int) ($detail->harga_satuan ?? $detail->produk?->harga ?? 0),
            ];
        })->values()->all();
    }
}
