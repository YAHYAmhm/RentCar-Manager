<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class ReservationController extends Controller
{
    // Afficher les réservations
    public function index()
    {
        return response()->json(
            Reservation::with(['client', 'voiture'])
                ->latest()
                ->get()
        );
    }

    // Vérifier si la voiture est déjà réservée
    private function verifierDisponibilite(
        $voitureId,
        $debut,
        $fin,
        $reservationId = null
    ) {
        $existe = Reservation::where('voiture_id', $voitureId)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->when($reservationId, function ($query) use ($reservationId) {
                $query->where('id', '!=', $reservationId);
            })
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages([
                'voiture_id' => 'Cette voiture est déjà réservée pour cette période.'
            ]);
        }
    }

    // Ajouter une réservation
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'voiture_id' => 'required|exists:voitures,id',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
            'remarques' => 'nullable|string',
        ]);

        $voiture = Voiture::findOrFail($data['voiture_id']);

        if ($voiture->etat !== 'en_service') {
            throw ValidationException::withMessages([
                'voiture_id' => "Cette voiture n'est pas en service."
            ]);
        }

        $this->verifierDisponibilite(
            $data['voiture_id'],
            $data['date_debut'],
            $data['date_fin']
        );

        $jours = Carbon::parse($data['date_debut'])
            ->diffInDays(Carbon::parse($data['date_fin']));

        $reservation = Reservation::create([
            ...$data,
            'nombre_jours' => $jours,
            'prix_jour' => $voiture->prix_jour,
            'montant_total' => $jours * $voiture->prix_jour,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'message' => 'Réservation ajoutée avec succès',
            'reservation' => $reservation->load(['client', 'voiture'])
        ], 201);
    }

    // Afficher une réservation
    public function show(Reservation $reservation)
    {
        return response()->json(
            $reservation->load(['client', 'voiture'])
        );
    }

    // Modifier une réservation
    public function update(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'voiture_id' => 'required|exists:voitures,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'statut' => 'required|in:en_attente,confirmee,annulee,terminee',
            'remarques' => 'nullable|string',
        ]);

        if (in_array($data['statut'], ['en_attente', 'confirmee'])) {
            $voiture = Voiture::findOrFail($data['voiture_id']);

            if ($voiture->etat !== 'en_service') {
                throw ValidationException::withMessages([
                    'voiture_id' => "Cette voiture n'est pas en service."
                ]);
            }

            $this->verifierDisponibilite(
                $data['voiture_id'],
                $data['date_debut'],
                $data['date_fin'],
                $reservation->id
            );
        } else {
            $voiture = Voiture::findOrFail($data['voiture_id']);
        }

        $jours = Carbon::parse($data['date_debut'])
            ->diffInDays(Carbon::parse($data['date_fin']));

        $reservation->update([
            ...$data,
            'nombre_jours' => $jours,
            'prix_jour' => $voiture->prix_jour,
            'montant_total' => $jours * $voiture->prix_jour,
        ]);

        return response()->json([
            'message' => 'Réservation modifiée avec succès',
            'reservation' => $reservation->load(['client', 'voiture'])
        ]);
    }

    // Annuler une réservation (sans supprimer l'historique)
    public function destroy(Reservation $reservation)
    {
        $reservation->update(['statut' => 'annulee']);

        return response()->json([
            'message' => 'Réservation annulée avec succès'
        ]);
    }
}
