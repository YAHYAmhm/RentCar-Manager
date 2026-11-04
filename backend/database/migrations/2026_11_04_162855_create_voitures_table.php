<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voitures', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('modele');
            $table->string('immatriculation')->unique();
            $table->integer('annee');
            $table->string('couleur')->nullable();
            $table->string('carburant');
            $table->string('boite_vitesse');
            $table->integer('places')->default(5);
            $table->integer('kilometrage')->default(0);
            $table->decimal('prix_jour', 10, 2);
            $table->string('etat')->default('en_service');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voitures');
    }
};