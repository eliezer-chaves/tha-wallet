<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Validação prévia da conexão com banco
            if (!$this->isDatabaseConnected()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
                ], 503);
            }

            // Verifica se CPF já existe
            if (User::where('usr_identity', $request->usr_identity)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'CPF já cadastrado'
                ], 409);
            }

            // Verifica se Email já existe
            if (User::where('usr_email', $request->usr_email)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email já cadastrado'
                ], 409);
            }

            $userData = $request->all();
            $userData['usr_terms_accept'] = (bool) $request->usr_terms_accept;

            $userData['usr_password'] = bcrypt($userData['usr_password']);
            $user = User::create($userData);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuário criado com sucesso!'
            ], 201);

        } catch (\PDOException $e) {
            // Log do erro para debug
            \Log::error('Erro PDO na criação de usuário: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ], 503);

        } catch (\Illuminate\Database\QueryException $e) {
            // Log do erro para debug
            \Log::error('Erro de Query na criação de usuário: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro na operação do banco de dados'
            ], 500);

        } catch (\Exception $e) {
            // Log do erro para debug
            \Log::error('Erro geral na criação de usuário: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * Verifica se o banco de dados está conectado
     */
    private function isDatabaseConnected(): bool
    {
        try {
            DB::connection()->getPdo();
            // Teste adicional com uma query simples
            DB::select('SELECT 1');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}