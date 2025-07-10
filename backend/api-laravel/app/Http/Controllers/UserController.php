<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'usr_first_name' => 'required|string|max:255',
            'usr_last_name' => 'required|string|max:255',
            'usr_identity' => 'required|string|unique:usr_user,usr_identity|max:255',
            'usr_email' => 'required|email|unique:usr_user,usr_email|max:255',
            'usr_password' => 'required|string|min:6|confirmed',
            'usr_phone' => 'nullable|string|max:20',
            'usr_birth_date' => 'nullable|date|before:today',
            'usr_status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            
            $userData = $request->all();
            $userData['usr_password'] = bcrypt($userData['usr_password']); // Garante que a senha será hasheada

            $user = User::create($userData);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuário criado com sucesso'
            ], 201);

        } catch (QueryException $e) {
            // Código específico para erro de conexão com o banco de dados (MySQL: 2002)
            if ($e->getCode() == 2002) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não foi possível conectar ao servidor',
                    'error_code' => 'database_connection_error'
                ], 503); // 503 Service Unavailable é apropriado para erros de servidor
            }

            // Outros erros de banco de dados (como violação de chave única)
            return response()->json([
                'success' => false,
                'message' => 'Erro no banco de dados: ' . $e->getMessage(),
                'error_code' => 'database_error'
            ], 500);

        } catch (\Exception $e) {
            // Outros erros genéricos
            return response()->json([
                'success' => false,
                'message' => 'Erro inesperado: ' . $e->getMessage(),
                'error_code' => 'server_error'
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function showUser($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuário encontrado'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado'
            ], 404);
        }
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }

    /**
     * Ativar/Desativar usuário
     */
    public function toggleStatus($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->usr_status = $user->usr_status === 'active' ? 'inactive' : 'active';
            $user->save();

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Status do usuário alterado com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar status: ' . $e->getMessage()
            ], 500);
        }
    }
}
