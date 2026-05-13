<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\KeranjangController;
use App\Http\Controllers\Api\CheckoutController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $req) => $req->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('keranjang')->group(function () {
        Route::get('/',              [KeranjangController::class, 'index']);
        Route::post('/',             [KeranjangController::class, 'store']);
        Route::delete('/clear',      [KeranjangController::class, 'clear']);
        Route::patch('/{detail_id}', [KeranjangController::class, 'update']);
        Route::delete('/{detail_id}', [KeranjangController::class, 'destroy']);
    });

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders',                [CheckoutController::class, 'index']);
    Route::get('/orders/{id}',           [CheckoutController::class, 'show']);
    Route::patch('/orders/{id}/cancel',  [CheckoutController::class, 'cancel']);
});

Route::get('/kategori',              [KategoriController::class, 'index']);
Route::get('/kategori/{kategori}',   [KategoriController::class, 'show']);
Route::get('/produk',                [ProdukController::class, 'index']);
Route::get('/produk/best-sellers',   [ProdukController::class, 'bestSellers']);
Route::get('/produk/{produk}',       [ProdukController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post  ('/kategori',             [KategoriController::class, 'store']);
    Route::put   ('/kategori/{kategori}',  [KategoriController::class, 'update']);
    Route::delete('/kategori/{kategori}',  [KategoriController::class, 'destroy']);

    Route::post  ('/produk',           [ProdukController::class, 'store']);
    Route::post  ('/produk/{produk}',  [ProdukController::class, 'update']);
    Route::delete('/produk/{produk}',  [ProdukController::class, 'destroy']);
});
