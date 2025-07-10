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
    public function index(): JsonResponse
    {
        $users = User::all();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
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
            'usr_phone_code' => 'nullable|string|max:5',
            'usr_birth_date' => 'nullable|date|before:today',
            'usr_status' => 'sometimes|in:active,inactive,pending',
            'usr_address' => 'nullable|json',
            'usr_terms' => 'required|boolean',
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
            $userData['usr_password'] = bcrypt($userData['usr_password']);
            
            // Se usr_address for string JSON, converte para array
            if (isset($userData['usr_address']) && is_string($userData['usr_address'])) {
                $userData['usr_address'] = json_decode($userData['usr_address'], true);
            }

            $user = User::create($userData);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuário criado com sucesso'
            ], 201);

        } catch (QueryException $e) {
            if ($e->getCode() == 2002) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não foi possível conectar ao servidor',
                    'error_code' => 'database_connection_error'
                ], 503);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro no banco de dados: ' . $e->getMessage(),
                'error_code' => 'database_error'
            ], 500);

        } catch (\Exception $e) {
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
    public function show($id): JsonResponse
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
     * Update the specified user in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'usr_first_name' => 'sometimes|string|max:255',
                'usr_last_name' => 'sometimes|string|max:255',
                'usr_identity' => 'sometimes|string|unique:usr_user,usr_identity,'.$user->usr_id.',usr_id|max:255',
                'usr_email' => 'sometimes|email|unique:usr_user,usr_email,'.$user->usr_id.',usr_id|max:255',
                'usr_password' => 'sometimes|string|min:6|confirmed',
                'usr_phone' => 'nullable|string|max:20',
                'usr_phone_code' => 'nullable|string|max:5',
                'usr_birth_date' => 'nullable|date|before:today',
                'usr_status' => 'sometimes|in:active,inactive,pending',
                'usr_address' => 'nullable|json',
                'usr_terms' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->all();
            
            if (isset($updateData['usr_password'])) {
                $updateData['usr_password'] = bcrypt($updateData['usr_password']);
            }
            
            if (isset($updateData['usr_address']) && is_string($updateData['usr_address'])) {
                $updateData['usr_address'] = json_decode($updateData['usr_address'], true);
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuário atualizado com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuário removido com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover usuário: ' . $e->getMessage()
            ], 500);
        }
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