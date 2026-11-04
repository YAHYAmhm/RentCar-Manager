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
    Schema::create('paiements', function (Blueprint $table) {
        $table->id();

        $table->foreignId('contrat_id')
              ->constrained('contrats')
              ->restrictOnDelete();

        $table->decimal('montant', 10, 2);

        $table->enum('mode_paiement', [
            'especes',
            'carte',
            'virement',
            'cheque'
        ]);

        $table->date('date_paiement');

        $table->string('reference')->nullable();

        $table->text('remarques')->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
