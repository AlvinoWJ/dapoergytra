<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\ProdukController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $req) => $req->user());
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/kategori',              [KategoriController::class, 'index']);
Route::get('/kategori/{kategori}',   [KategoriController::class, 'show']);
Route::get('/produk',                [ProdukController::class, 'index']);
Route::get('/produk/best-sellers',   [ProdukController::class, 'bestSellers']);
Route::get('/produks/{produk}',       [ProdukController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post  ('/kategoris',             [KategoriController::class, 'store']);
    Route::put   ('/kategoris/{kategori}',  [KategoriController::class, 'update']);
    Route::delete('/kategoris/{kategori}',  [KategoriController::class, 'destroy']);

    Route::post  ('/produks',           [ProdukController::class, 'store']);
    Route::post  ('/produks/{produk}',  [ProdukController::class, 'update']); // POST karena multipart/form-data
    Route::delete('/produks/{produk}',  [ProdukController::class, 'destroy']);
});
