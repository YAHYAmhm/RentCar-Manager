<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaiementController extends Controller
{
    // Liste des paiements
    public function index()
    {
        return response()->json(
            Paiement::with(
                'contrat.reservation.client',
                'contrat.reservation.voiture'
            )->latest()->get()
        );
    }

    // Enregistrer un paiement
    public function store(Request $request)
    {
        $data = $request->validate([
            'contrat_id' => 'required|exists:contrats,id',
            'montant' => 'required|numeric|gt:0|decimal:0,2',
            'mode_paiement' => 'required|in:especes,carte,virement,cheque',
            'date_paiement' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'remarques' => 'nullable|string',
        ]);

        $paiement = DB::transaction(function () use ($data) {
            $contrat = Contrat::whereKey($data['contrat_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($contrat->statut !== 'actif') {
                throw ValidationException::withMessages([
                    'contrat_id' => 'Le contrat doit être actif.'
                ]);
            }

            // Calcul en centimes pour éviter les erreurs d'arrondi
            $totalCentimes = (int) round(
                (float) $contrat->montant_total * 100
            );

            $payeCentimes = (int) round(
                (float) $contrat->paiements()->sum('montant') * 100
            );

            $nouveauCentimes = (int) round(
                (float) $data['montant'] * 100
            );

            if ($nouveauCentimes > $totalCentimes - $payeCentimes) {
                throw ValidationException::withMessages([
                    'montant' => 'Le montant dépasse le reste à payer.'
                ]);
            }

            return Paiement::create($data);
        });

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'paiement' => $paiement->load('contrat')
        ], 201);
    }

    // Afficher un paiement
    public function show(Paiement $paiement)
    {
        return response()->json(
            $paiement->load(
                'contrat.reservation.client',
                'contrat.reservation.voiture'
            )
        );
    }

    // Résumé financier d'un contrat
    public function resume(Contrat $contrat)
    {
        $total = (float) $contrat->montant_total;
        $paye = (float) $contrat->paiements()->sum('montant');
        $reste = max(0, round($total - $paye, 2));

        return response()->json([
            'contrat_id' => $contrat->id,
            'numero_contrat' => $contrat->numero_contrat,
            'montant_total' => $total,
            'montant_paye' => $paye,
            'reste_a_payer' => $reste,
            'statut_paiement' => $reste <= 0
                ? 'paye'
                : ($paye > 0 ? 'partiel' : 'non_paye'),
        ]);
    }

    // Pas de modification directe d'un paiement
    public function update(Request $request, Paiement $paiement)
    {
        return response()->json([
            'message' => 'Modification non autorisée.'
        ], 403);
    }

    // Pas de suppression directe d'un paiement
    public function destroy(Paiement $paiement)
    {
        return response()->json([
            'message' => 'Suppression non autorisée.'
        ], 403);
    }
}
