<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [
        'contrat_id',
        'montant',
        'mode_paiement',
        'date_paiement',
        'reference',
        'remarques',
    ];

    public function contrat()
    {
        return $this->belongsTo(Contrat::class);
    }
}
