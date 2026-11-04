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
    Schema::create('retours', function (Blueprint $table) {
        $table->id();

        $table->foreignId('contrat_id')
              ->unique()
              ->constrained('contrats')
              ->restrictOnDelete();

        $table->date('date_retour');

        $table->integer('kilometrage_depart');
        $table->integer('kilometrage_retour');

        $table->enum('etat_retour', [
            'bon',
            'endommage',
            'maintenance'
        ])->default('bon');

        $table->decimal('frais_supplementaires', 10, 2)
              ->default(0);

        $table->text('observations')->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retours');
    }
};
