<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContratController extends Controller
{
    // Afficher tous les contrats
    public function index()
    {
        return response()->json(
            Contrat::with('reservation.client', 'reservation.voiture')
                ->latest()
                ->get()
        );
    }

    // Créer un contrat
    public function store(Request $request)
    {
        $data = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'caution' => 'required|numeric|min:0',
            'conditions' => 'nullable|string',
        ]);

        $contrat = DB::transaction(function () use ($data) {

            $reservation = Reservation::whereKey($data['reservation_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($reservation->statut !== 'confirmee') {
                throw ValidationException::withMessages([
                    'reservation_id' =>
                        'La réservation doit être confirmée.'
                ]);
            }

            if (Contrat::where('reservation_id', $reservation->id)->exists()) {
                throw ValidationException::withMessages([
                    'reservation_id' =>
                        'Cette réservation possède déjà un contrat.'
                ]);
            }

            $contrat = Contrat::create([
                'reservation_id' => $reservation->id,
                'numero_contrat' => 'TMP-' . uniqid(),
                'date_signature' => now()->toDateString(),
                'montant_total' => $reservation->montant_total,
                'caution' => $data['caution'],
                'conditions' => $data['conditions'] ?? null,
                'statut' => 'actif',
            ]);

            $contrat->update([
                'numero_contrat' =>
                    'CTR-' . str_pad($contrat->id, 6, '0', STR_PAD_LEFT)
            ]);

            return $contrat;
        });

        return response()->json([
            'message' => 'Contrat créé avec succès',
            'contrat' => $contrat->load(
                'reservation.client',
                'reservation.voiture'
            )
        ], 201);
    }

    // Afficher un contrat
    public function show(Contrat $contrat)
    {
        return response()->json(
            $contrat->load(
                'reservation.client',
                'reservation.voiture'
            )
        );
    }

    // Modifier les informations du contrat
    public function update(Request $request, Contrat $contrat)
    {
        $data = $request->validate([
            'caution' => 'sometimes|required|numeric|min:0',
            'conditions' => 'nullable|string',
            'statut' => 'sometimes|required|in:actif,termine,annule',
        ]);

        $contrat->update($data);

        return response()->json([
            'message' => 'Contrat modifié avec succès',
            'contrat' => $contrat->load(
                'reservation.client',
                'reservation.voiture'
            )
        ]);
    }

    // Annuler le contrat sans supprimer l'historique
    public function destroy(Contrat $contrat)
    {
        $contrat->update(['statut' => 'annule']);

        return response()->json([
            'message' => 'Contrat annulé avec succès'
        ]);
    }
}
