<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Retour extends Model
{
    protected $fillable = [
        'contrat_id',
        'date_retour',
        'kilometrage_depart',
        'kilometrage_retour',
        'etat_retour',
        'frais_supplementaires',
        'observations',
    ];

    public function contrat()
    {
        return $this->belongsTo(Contrat::class);
    }
}
