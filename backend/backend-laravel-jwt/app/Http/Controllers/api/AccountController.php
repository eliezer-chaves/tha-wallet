<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\AccountModel;
use App\Enums\eAccountType;
use Exception;

class AccountController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $accounts = $user->accounts()->get();
            Log::info($accounts);
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
            \Log::info('Dados recebidos para criação de conta: ' . json_encode($data));

            $validator = Validator::make($data, [
                'acc_name' => 'required|string|max:255',
                'acc_type' => 'required|in:' . implode(',', eAccountType::values()),
                'acc_initial_value' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $type = eAccountType::from($data['acc_type']);

            $account = AccountModel::create([
                'usr_id' => Auth::id(),
                'acc_name' => $data['acc_name'],
                'acc_type' => $data['acc_type'],
                'acc_color' => $type->color(),
                'acc_initial_value' => $data['acc_initial_value'],
                'acc_current_balance' => $data['acc_initial_value']
            ]);

            return response()->json($account, 201);
        } catch (Exception $e) {
            \Log::error('Erro ao criar conta: ' . $e->getMessage());
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
}