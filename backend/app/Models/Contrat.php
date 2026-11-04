<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $fillable = [
        'reservation_id',
        'numero_contrat',
        'date_signature',
        'montant_total',
        'caution',
        'statut',
        'conditions',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
    public function paiements()
{
    return $this->hasMany(Paiement::class);
}
public function retour()
{
    return $this->hasOne(Retour::class);
}
}
