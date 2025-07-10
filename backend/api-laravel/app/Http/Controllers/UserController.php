<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;

class UserController extends Controller
{
    public function store(Request $request)
    {
        try {
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

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro no servidor'
            ], 500);
        }
    }
}