<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\eTransactionType;
use App\Models\Account;

class TransactionModel extends Model
{
    protected $table = 'trs_transaction';
    protected $primaryKey = 'trs_id';
    public $timestamps = true;

    protected $fillable = [
        'trs_sender_account_id',
        'trs_receiver_account_id',
        'trs_amount',
        'trs_transfer_type',
        'trs_description',
        'trs_transfered_at',
    ];

    protected $casts = [
        'trs_transfer_type' => eTransactionType::class,
        'trs_transfered_at' => 'datetime',
        'trs_amount' => 'decimal:2',
    ];

    /**
     * Conta remetente (de onde sai o dinheiro)
     */
    public function senderAccount(): BelongsTo
    {
        return $this->belongsTo(AccountModel::class, 'trs_sender_account_id', 'acc_id');
    }

    /**
     * Conta destinatária (para onde vai o dinheiro)
     */
    public function receiverAccount(): BelongsTo
    {
        return $this->belongsTo(AccountModel::class, 'trs_receiver_account_id', 'acc_id');
    }

    
}
