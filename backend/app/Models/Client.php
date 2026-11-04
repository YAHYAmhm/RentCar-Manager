<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'nom',
        'prenom',
        'cin',
        'telephone',
        'email',
        'adresse',
        'numero_permis',
        'date_naissance',
    ];
}