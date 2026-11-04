<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voiture extends Model
{
    protected $fillable = [
        'marque',
        'modele',
        'immatriculation',
        'annee',
        'couleur',
        'carburant',
        'boite_vitesse',
        'places',
        'kilometrage',
        'prix_jour',
        'etat',
        'description',
        'photo',
    ];
}