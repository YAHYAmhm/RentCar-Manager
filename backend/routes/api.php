<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VoitureController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RetourController;
use App\Http\Controllers\DashboardController;

Route::apiResource('voitures', VoitureController::class);
Route::apiResource('clients', ClientController::class);
Route::apiResource('reservations', ReservationController::class);
Route::apiResource('contrats', ContratController::class);
Route::get(
    'contrats/{contrat}/resume-paiement',
    [PaiementController::class, 'resume']
);

Route::apiResource('paiements', PaiementController::class)
    ->only(['index', 'store', 'show']);
Route::apiResource('retours', RetourController::class)
    ->only(['index', 'store', 'show']);
Route::get('/dashboard', [DashboardController::class, 'index']);