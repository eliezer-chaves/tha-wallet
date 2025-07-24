<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\TransactionModel;
use App\Models\AccountModel;
use App\Enums\eTransactionType;
use Exception;

class TransactionController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            // Retorna todas as transferências feitas por ou para contas do usuário
            $transactions = TransactionModel::whereHas('senderAccount', fn($q) => $q->where('usr_id', $user->usr_id))
                ->orWhereHas('receiverAccount', fn($q) => $q->where('usr_id', $user->usr_id))
                ->orderByDesc('trs_transfered_at')
                ->get();

            Log::info($transactions);


            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);

        } catch (Exception $e) {
            Log::error('Erro ao buscar transferências: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'fetch_error',
                'error_title' => 'Erro ao buscar transferências',
                'error_message' => 'Não foi possível carregar as transferências.'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $userId = Auth::id();

            $validator = Validator::make($data, [
                'trs_sender_account_id' => 'required|integer|exists:acc_account,acc_id',
                'trs_receiver_account_id' => 'required|integer|exists:acc_account,acc_id|different:trs_sender_account_id',
                'trs_amount' => 'required|numeric|min:0.01',
                'trs_transfer_type' => 'required|in:' . implode(',', eTransactionType::values()),
                'trs_description' => 'nullable|string|max:255',
                'trs_transfered_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $sender = AccountModel::where('usr_id', $userId)->find($data['trs_sender_account_id']);
            $receiver = AccountModel::where('usr_id', $userId)->find($data['trs_receiver_account_id']);

            if (!$sender || !$receiver) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Contas inválidas',
                    'error_message' => 'As contas devem pertencer ao usuário autenticado.'
                ], 403);
            }

            if ($sender->acc_currency !== $receiver->acc_currency) {
                return response()->json([
                    'error_type' => 'currency_mismatch',
                    'error_title' => 'Moedas diferentes',
                    'error_message' => 'As contas devem estar na mesma moeda para transferências.'
                ], 422);
            }

            if ($sender->acc_current_balance < $data['trs_amount']) {
                return response()->json([
                    'error_type' => 'insufficient_funds',
                    'error_title' => 'Saldo insuficiente',
                    'error_message' => 'A conta de origem não possui saldo suficiente.'
                ], 422);
            }

            // Realiza a transação
            $transaction = TransactionModel::create([
                'trs_sender_account_id' => $sender->acc_id,
                'trs_receiver_account_id' => $receiver->acc_id,
                'trs_amount' => $data['trs_amount'],
                'trs_transfer_type' => $data['trs_transfer_type'],
                'trs_description' => $data['trs_description'] ?? null,
                'trs_transfered_at' => $data['trs_transfered_at'] ?? now(),
            ]);

            // Atualiza os saldos das contas
            $sender->decrement('acc_current_balance', $data['trs_amount']);
            $receiver->increment('acc_current_balance', $data['trs_amount']);

            return response()->json($transaction, 201);
        } catch (Exception $e) {
            Log::error('Erro ao registrar transferência: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'creation_error',
                'error_title' => 'Erro ao transferir',
                'error_message' => 'Erro ao registrar a transferência entre contas.'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $userId = Auth::id();
            $transaction = TransactionModel::with(['senderAccount', 'receiverAccount'])
                ->findOrFail($id);

            if (
                $transaction->senderAccount->usr_id !== $userId &&
                $transaction->receiverAccount->usr_id !== $userId
            ) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Transferência não encontrada',
                    'error_message' => 'Essa transferência não pertence a você.'
                ], 404);
            }

            return response()->json($transaction);
        } catch (Exception $e) {
            Log::error('Erro ao buscar transferência: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'fetch_error',
                'error_title' => 'Erro ao buscar transferência',
                'error_message' => 'Não foi possível encontrar a transferência solicitada.'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $userId = Auth::id();
            $transaction = TransactionModel::findOrFail($id);

            $sender = AccountModel::find($transaction->trs_sender_account_id);
            $receiver = AccountModel::find($transaction->trs_receiver_account_id);

            if (!$sender || $sender->usr_id !== $userId) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Transferência não encontrada',
                    'error_message' => 'Essa transferência não pertence a você.'
                ], 404);
            }

            // Reverte a transferência
            $sender->increment('acc_current_balance', $transaction->trs_amount);
            $receiver->decrement('acc_current_balance', $transaction->trs_amount);

            $transaction->delete();

            return response()->json(['message' => 'Transferência excluída com sucesso.']);
        } catch (Exception $e) {
            Log::error('Erro ao excluir transferência: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'delete_error',
                'error_title' => 'Erro ao excluir',
                'error_message' => 'Não foi possível excluir a transferência.'
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {
            $data = $request->all();
            $userId = Auth::id();

            // Validação dos dados de entrada
            $validator = Validator::make($data, [
                'trs_sender_account_id' => 'sometimes|integer|exists:acc_account,acc_id',
                'trs_receiver_account_id' => 'sometimes|integer|exists:acc_account,acc_id',
                'trs_amount' => 'sometimes|numeric|min:0.01',
                'trs_transfer_type' => 'sometimes|in:' . implode(',', eTransactionType::values()),
                'trs_description' => 'nullable|string|max:255',
                'trs_transfered_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Busca a transação existente
            $transaction = TransactionModel::with(['senderAccount', 'receiverAccount'])
                ->findOrFail($id);

            // Verifica se o usuário tem permissão para editar
            if (
                $transaction->senderAccount->usr_id !== $userId &&
                $transaction->receiverAccount->usr_id !== $userId
            ) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Transferência não encontrada',
                    'error_message' => 'Essa transferência não pertence a você.'
                ], 404);
            }

            // Inicia uma transação de banco de dados para atomicidade
            DB::beginTransaction();

            // Reverte o saldo original antes de aplicar as alterações
            $transaction->senderAccount->increment('acc_current_balance', $transaction->trs_amount);
            $transaction->receiverAccount->decrement('acc_current_balance', $transaction->trs_amount);

            // Determina as novas contas (se foram alteradas)
            $newSenderId = $data['trs_sender_account_id'] ?? $transaction->trs_sender_account_id;
            $newReceiverId = $data['trs_receiver_account_id'] ?? $transaction->trs_receiver_account_id;
            $newAmount = $data['trs_amount'] ?? $transaction->trs_amount;

            // Busca as novas contas
            $newSender = AccountModel::where('usr_id', $userId)->findOrFail($newSenderId);
            $newReceiver = AccountModel::where('usr_id', $userId)->findOrFail($newReceiverId);

            // Validações das novas contas
            if ($newSender->acc_currency !== $newReceiver->acc_currency) {
                DB::rollBack();
                return response()->json([
                    'error_type' => 'currency_mismatch',
                    'error_title' => 'Moedas diferentes',
                    'error_message' => 'As contas devem estar na mesma moeda para transferências.'
                ], 422);
            }

            if ($newSender->acc_current_balance < $newAmount) {
                DB::rollBack();
                return response()->json([
                    'error_type' => 'insufficient_funds',
                    'error_title' => 'Saldo insuficiente',
                    'error_message' => 'A conta de origem não possui saldo suficiente.'
                ], 422);
            }

            // Atualiza os campos da transação
            $updateData = [];
            if (isset($data['trs_sender_account_id'])) {
                $updateData['trs_sender_account_id'] = $data['trs_sender_account_id'];
            }
            if (isset($data['trs_receiver_account_id'])) {
                $updateData['trs_receiver_account_id'] = $data['trs_receiver_account_id'];
            }
            if (isset($data['trs_amount'])) {
                $updateData['trs_amount'] = $data['trs_amount'];
            }
            if (isset($data['trs_transfer_type'])) {
                $updateData['trs_transfer_type'] = $data['trs_transfer_type'];
            }
            if (array_key_exists('trs_description', $data)) {
                $updateData['trs_description'] = $data['trs_description'];
            }
            if (isset($data['trs_transfered_at'])) {
                $updateData['trs_transfered_at'] = $data['trs_transfered_at'];
            }

            // Atualiza a transação
            $transaction->update($updateData);

            // Aplica as alterações nos saldos das novas contas
            $newSender->decrement('acc_current_balance', $newAmount);
            $newReceiver->increment('acc_current_balance', $newAmount);

            // Confirma as alterações no banco de dados
            DB::commit();

            // Recarrega os relacionamentos para a resposta
            $transaction->load(['senderAccount', 'receiverAccount']);

            return response()->json($transaction);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Transação não encontrada: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'not_found',
                'error_title' => 'Transação não encontrada',
                'error_message' => 'A transação solicitada não existe.'
            ], 404);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar transferência: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'update_error',
                'error_title' => 'Erro ao atualizar',
                'error_message' => 'Não foi possível atualizar a transferência.'
            ], 500);
        }
    }
    public function transferTypes()
    {
        return response()->json([
            'types' => array_map(fn($case) => [
                'value' => $case->value,
                'label' => $case->value // Usamos o value diretamente como label
            ], eTransactionType::cases())
        ]);
    }
}
