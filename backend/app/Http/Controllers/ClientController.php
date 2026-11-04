<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    // Afficher tous les clients
    public function index()
    {
        return response()->json(Client::all());
    }

    // Ajouter un client
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|unique:clients,cin',
            'telephone' => 'required|string',
            'email' => 'nullable|email',
            'adresse' => 'nullable|string',
            'numero_permis' => 'required|string',
            'date_naissance' => 'nullable|date',
        ]);

        $client = Client::create($data);

        return response()->json([
            'message' => 'Client ajouté avec succès',
            'client' => $client
        ], 201);
    }

    // Afficher un client
    public function show(Client $client)
    {
        return response()->json($client);
    }

    // Modifier un client
    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => [
                'required',
                'string',
                Rule::unique('clients', 'cin')->ignore($client->id)
            ],
            'telephone' => 'required|string',
            'email' => 'nullable|email',
            'adresse' => 'nullable|string',
            'numero_permis' => 'required|string',
            'date_naissance' => 'nullable|date',
        ]);

        $client->update($data);

        return response()->json([
            'message' => 'Client modifié avec succès',
            'client' => $client
        ]);
    }

    // Supprimer un client
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'message' => 'Client supprimé avec succès'
        ]);
    }
}
