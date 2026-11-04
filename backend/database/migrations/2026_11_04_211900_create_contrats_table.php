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
    Schema::create('contrats', function (Blueprint $table) {
        $table->id();

        $table->foreignId('reservation_id')
              ->unique()
              ->constrained('reservations')
              ->restrictOnDelete();

        $table->string('numero_contrat')->unique();

        $table->date('date_signature');

        $table->decimal('montant_total', 10, 2);

        $table->decimal('caution', 10, 2)->default(0);

        $table->enum('statut', [
            'actif',
            'termine',
            'annule'
        ])->default('actif');

        $table->text('conditions')->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
