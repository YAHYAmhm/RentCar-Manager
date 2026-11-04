<?php

namespace App\Http\Controllers;

use App\Models\Retour;
use App\Models\Contrat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RetourController extends Controller
{
    // Afficher tous les retours
    public function index()
    {
        return response()->json(
            Retour::with([
                'contrat.reservation.client',
                'contrat.reservation.voiture'
            ])->latest()->get()
        );
    }

    // Enregistrer un retour
    public function store(Request $request)
    {
        $data = $request->validate([
            'contrat_id' => 'required|exists:contrats,id',
            'date_retour' => 'required|date',
            'kilometrage_retour' => 'required|integer|min:0',
            'etat_retour' => 'required|in:bon,endommage,maintenance',
            'frais_supplementaires' => 'required|numeric|min:0',
            'observations' => 'nullable|string',
        ]);

        $retour = DB::transaction(function () use ($data) {

            $contrat = Contrat::whereKey($data['contrat_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($contrat->statut !== 'actif') {
                throw ValidationException::withMessages([
                    'contrat_id' => 'Le contrat doit être actif.'
                ]);
            }

            if (Retour::where('contrat_id', $contrat->id)->exists()) {
                throw ValidationException::withMessages([
                    'contrat_id' => 'Ce contrat possède déjà un retour.'
                ]);
            }

            $reservation = $contrat->reservation;
            $voiture = $reservation->voiture;

            // Verrouiller la voiture pour protéger son kilométrage
            $voiture = $voiture->newQuery()
                ->whereKey($voiture->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($data['date_retour'] < $reservation->date_debut) {
                throw ValidationException::withMessages([
                    'date_retour' =>
                        'La date de retour doit être après le début de location.'
                ]);
            }

            $kmDepart = $voiture->kilometrage;

            if ($data['kilometrage_retour'] < $kmDepart) {
                throw ValidationException::withMessages([
                    'kilometrage_retour' =>
                        'Le kilométrage retour doit être supérieur ou égal au départ.'
                ]);
            }

            $retour = Retour::create([
                ...$data,
                'kilometrage_depart' => $kmDepart,
            ]);

            // Mise à jour du kilométrage
            $voiture->kilometrage = $data['kilometrage_retour'];

            // Mise à jour de l'état de la voiture
            $voiture->etat = $data['etat_retour'] === 'bon'
                ? 'en_service'
                : 'en_maintenance';

            $voiture->save();

            // Terminer le contrat et la réservation
            $contrat->update(['statut' => 'termine']);
            $reservation->update(['statut' => 'terminee']);

            return $retour;
        });

        return response()->json([
            'message' => 'Retour enregistré avec succès',
            'retour' => $retour->load([
                'contrat.reservation.client',
                'contrat.reservation.voiture'
            ])
        ], 201);
    }

    // Afficher un retour
    public function show(Retour $retour)
    {
        return response()->json(
            $retour->load([
                'contrat.reservation.client',
                'contrat.reservation.voiture'
            ])
        );
    }
}
