<?php

use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'showPublic'])->whereNumber('product');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');

Route::prefix('admin')
    ->middleware('auth:sanctum')
    ->group(function (): void {
        Route::get('/products', [ProductController::class, 'index'])
            ->middleware('permission:products.manage')
            ->name('admin.products.index');
        Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.manage');
        Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:products.manage')->whereNumber('product');
        Route::match(['put', 'patch'], '/products/{product}', [ProductController::class, 'update'])->middleware('permission:products.manage')->whereNumber('product');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:products.manage')->whereNumber('product');

        Route::get('/categories', [CategoryController::class, 'index'])
            ->middleware('permission:categories.manage')
            ->name('admin.categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:categories.manage');
        Route::match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:categories.manage')->whereNumber('category');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:categories.manage')->whereNumber('category');

        Route::apiResource('users', AdminUserController::class)
            ->middleware('permission:users.manage');
    });
