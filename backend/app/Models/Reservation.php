<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'client_id',
        'voiture_id',
        'date_debut',
        'date_fin',
        'nombre_jours',
        'prix_jour',
        'montant_total',
        'statut',
        'remarques',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function voiture()
    {
        return $this->belongsTo(Voiture::class);
    }
    public function contrat()
    {
        return $this->hasOne(Contrat::class);
    }
}
