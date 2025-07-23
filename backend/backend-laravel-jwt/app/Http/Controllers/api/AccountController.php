<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\AccountModel;
use App\Enums\eAccountType;
use App\Enums\eCurrency;
use Exception;

class AccountController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $accounts = $user->accounts()
                ->orderBy('acc_type', 'asc')
                ->orderBy('acc_name', 'asc')
                ->get();

            return response()->json($accounts);
        } catch (Exception $e) {
            Log::error('Erro ao listar contas: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'fetch_error',
                'error_title' => 'Erro ao buscar contas',
                'error_message' => 'Não foi possível carregar as contas do usuário.'
            ], 500);
        }
    }


    public function store(Request $request)
    {
        try {
            $data = $request->all();

            $validator = Validator::make($data, [
                'acc_name' => 'required|string|max:255',
                'acc_type' => 'required|in:' . implode(',', eAccountType::values()),
                'acc_currency' => 'required|in:' . implode(',', eCurrency::values()), // Alterado para acc_currency
                'acc_initial_value' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $type = eAccountType::from($data['acc_type']);
            $currency = eCurrency::from($data['acc_currency']); // Alterado para acc_currency

            $account = AccountModel::create([
                'usr_id' => Auth::id(),
                'acc_name' => $data['acc_name'],
                'acc_type' => $data['acc_type'],
                'acc_color' => $type->color(),
                'acc_currency' => $data['acc_currency'], // Alterado para acc_currency
                'acc_initial_value' => $data['acc_initial_value'],
                'acc_current_balance' => $data['acc_initial_value']
            ]);

            return response()->json($account, 201);
        } catch (Exception $e) {
            Log::error('Erro ao criar conta: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'creation_error',
                'error_title' => 'Erro ao criar conta',
                'error_message' => 'Não foi possível criar a conta bancária.'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $account = AccountModel::where('usr_id', Auth::id())->find($id);

            if (!$account) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Conta não encontrada',
                    'error_message' => 'Essa conta bancária não pertence a você ou não existe.'
                ], 404);
            }

            return response()->json($account);
        } catch (Exception $e) {
            Log::error('Erro ao buscar conta: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'fetch_error',
                'error_title' => 'Erro ao buscar conta',
                'error_message' => 'Erro ao buscar conta bancária.'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $data = $request->all();

            $validator = Validator::make($data, [
                'acc_name' => 'sometimes|string|max:255',
                'acc_type' => 'sometimes|in:' . implode(',', eAccountType::values()),
                'acc_currency' => 'sometimes|in:' . implode(',', eCurrency::values()), // Alterado para acc_currency
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $account = AccountModel::where('usr_id', Auth::id())->find($id);

            if (!$account) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Conta não encontrada',
                    'error_message' => 'Essa conta bancária não pertence a você ou não existe.'
                ], 404);
            }

            if (isset($data['acc_type'])) {
                $type = eAccountType::from($data['acc_type']);
                $data['acc_color'] = $type->color();
            }

            $account->update($data);

            return response()->json($account);
        } catch (Exception $e) {
            Log::error('Erro ao atualizar conta: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'update_error',
                'error_title' => 'Erro ao atualizar conta',
                'error_message' => 'Erro ao atualizar conta bancária.'
            ], 500);
        }
    }
    public function currencyTypes()
    {
        return response()->json([
            'currencies' => array_map(function ($currency) {
                $enum = eCurrency::from($currency);
                return [
                    'value' => $currency,
                    'name' => $enum->name(),
                    'symbol' => $enum->symbol(),
                    'color' => $enum->color()
                ];
            }, eCurrency::values())
        ]);
    }
    public function destroy($id)
    {
        try {
            $account = AccountModel::where('usr_id', Auth::id())->find($id);

            if (!$account) {
                return response()->json([
                    'error_type' => 'not_found',
                    'error_title' => 'Conta não encontrada',
                    'error_message' => 'Essa conta bancária não pertence a você ou não existe.'
                ], 404);
            }

            $account->delete();

            return response()->json(['message' => 'Conta deletada com sucesso.']);
        } catch (Exception $e) {
            Log::error('Erro ao deletar conta: ' . $e->getMessage());

            return response()->json([
                'error_type' => 'delete_error',
                'error_title' => 'Erro ao deletar conta',
                'error_message' => 'Erro ao excluir a conta bancária.'
            ], 500);
        }
    }

    public function accountTypes()
    {
        return response()->json([
            'types' => eAccountType::values()
        ]);
    }

    /**
     * Soma o saldo de todas as contas do usuário
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function sumBalances()
    {
        try {
            $accounts = AccountModel::where('usr_id', Auth::id())->get();
            $totals = [];

            foreach ($accounts as $account) {
                $currency = $account->acc_currency->value; // Alterado para acc_currency
                $amount = $account->acc_current_balance ?? 0;

                if (!isset($totals[$currency])) {
                    $totals[$currency] = 0;
                }

                $totals[$currency] += $amount;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'totals' => $totals,
                    'accounts_count' => $accounts->count()
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Erro ao somar saldos das contas: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'sum_error',
                'error_title' => 'Erro ao calcular saldos',
                'error_message' => 'Ocorreu um erro ao somar os saldos das contas.'
            ], 500);
        }
    }
}