<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class VoitureController extends Controller
{
    // Afficher toutes les voitures
    public function index()
    {
        return response()->json(
            Voiture::orderBy('id', 'desc')->get()
        );
    }

    // Ajouter une voiture
    public function store(Request $request)
    {
        $data = $request->validate([
            'marque' => 'required|string|max:100',
            'modele' => 'required|string|max:100',
            'immatriculation' => 'required|string|max:50|unique:voitures,immatriculation',
            'annee' => 'required|integer|between:1900,2100',
            'couleur' => 'nullable|string|max:50',
            'carburant' => 'required|string|max:50',
            'boite_vitesse' => 'required|string|max:50',
            'places' => 'required|integer|min:1|max:30',
            'kilometrage' => 'required|integer|min:0',
            'prix_jour' => 'required|numeric|gt:0',
            'etat' => 'required|in:en_service,en_maintenance,hors_service',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')
                ->store('voitures', 'public');
        }

        try {
            $voiture = Voiture::create($data);
        } catch (\Throwable $e) {
            if (!empty($data['photo'])) {
                Storage::disk('public')->delete($data['photo']);
            }

            throw $e;
        }

        return response()->json([
            'message' => 'Voiture ajoutée avec succès',
            'voiture' => $voiture
        ], 201);
    }

    // Afficher une voiture
    public function show($id)
    {
        return response()->json(
            Voiture::findOrFail($id)
        );
    }

    // Modifier une voiture
    public function update(Request $request, $id)
    {
        $voiture = Voiture::findOrFail($id);

        $data = $request->validate([
            'marque' => 'required|string|max:100',
            'modele' => 'required|string|max:100',
            'immatriculation' => [
                'required',
                'string',
                'max:50',
                Rule::unique('voitures', 'immatriculation')
                    ->ignore($voiture->id)
            ],
            'annee' => 'required|integer|between:1900,2100',
            'couleur' => 'nullable|string|max:50',
            'carburant' => 'required|string|max:50',
            'boite_vitesse' => 'required|string|max:50',
            'places' => 'required|integer|min:1|max:30',
            'kilometrage' => 'required|integer|min:0',
            'prix_jour' => 'required|numeric|gt:0',
            'etat' => 'required|in:en_service,en_maintenance,hors_service',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $anciennePhoto = $voiture->photo;
        $nouvellePhoto = null;

        if ($request->hasFile('photo')) {
            $nouvellePhoto = $request->file('photo')
                ->store('voitures', 'public');

            $data['photo'] = $nouvellePhoto;
        }

        try {
            $voiture->update($data);
        } catch (\Throwable $e) {
            if ($nouvellePhoto) {
                Storage::disk('public')->delete($nouvellePhoto);
            }

            throw $e;
        }

        // Supprimer l'ancienne photo seulement
        // après la mise à jour réussie
        if ($nouvellePhoto && $anciennePhoto) {
            Storage::disk('public')->delete($anciennePhoto);
        }

        return response()->json([
            'message' => 'Voiture modifiée avec succès',
            'voiture' => $voiture->fresh()
        ]);
    }

    // Supprimer une voiture
    public function destroy($id)
    {
        $voiture = Voiture::findOrFail($id);

        $photo = $voiture->photo;

        // Si la voiture possède des réservations,
        // la base de données peut empêcher sa suppression.
        $voiture->delete();

        // Supprimer la photo uniquement si
        // la suppression de la voiture a réussi.
        if ($photo) {
            Storage::disk('public')->delete($photo);
        }

        return response()->json([
            'message' => 'Voiture supprimée avec succès'
        ]);
    }
}
