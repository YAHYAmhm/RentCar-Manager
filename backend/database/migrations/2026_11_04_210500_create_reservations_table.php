<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    
public function up(): void
{
    Schema::create('reservations', function (Blueprint $table) {
        $table->id();

        $table->foreignId('client_id')
              ->constrained('clients')
              ->restrictOnDelete();

        $table->foreignId('voiture_id')
              ->constrained('voitures')
              ->restrictOnDelete();

        $table->date('date_debut');
        $table->date('date_fin');

        $table->integer('nombre_jours');
        $table->decimal('prix_jour', 10, 2);
        $table->decimal('montant_total', 10, 2);

        $table->enum('statut', [
            'en_attente',
            'confirmee',
            'annulee',
            'terminee'
        ])->default('en_attente');

        $table->text('remarques')->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
