<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use App\Models\Client;
use App\Models\Reservation;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Retour;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_voitures' => Voiture::count(),

            'voitures_service' => Voiture::where(
                'etat', 'en_service'
            )->count(),

            'voitures_maintenance' => Voiture::where(
                'etat', 'en_maintenance'
            )->count(),

            'total_clients' => Client::count(),

            'total_reservations' => Reservation::count(),

            'reservations_actives' => Reservation::whereIn(
                'statut', ['en_attente', 'confirmee']
            )->count(),

            'total_contrats' => Contrat::count(),

            'contrats_actifs' => Contrat::where(
                'statut', 'actif'
            )->count(),

            'total_encaisse' => Paiement::sum('montant'),

            'total_retours' => Retour::count(),

            'dernieres_reservations' => Reservation::with([
                'client', 'voiture'
            ])->latest()->take(5)->get(),
        ]);
    }
}
