<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * REGISTER - Cria um novo usuário
     * Para que serve: Recebe dados do formulário Angular, valida e cria usuário no banco
     * Retorna: Token de acesso + dados do usuário
     */
    public function register(Request $request)
    {
        try {
            // Validação da conexão com banco
            if (!$this->isDatabaseConnected()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
                ], 503);
            }

            // Validação dos dados
            $request->validate([
                'usr_first_name' => 'required|string|max:255',
                'usr_last_name' => 'required|string|max:255',
                'usr_identity' => 'required|string|unique:usr_user,usr_identity',
                'usr_email' => 'required|string|email|max:255|unique:usr_user,usr_email',
                'usr_password' => 'required|string|min:8',
                'usr_terms_accept' => 'required|boolean',
            ]);

            // Verifica se termos foram aceitos
            if (!$request->usr_terms_accept) {
                return response()->json([
                    'success' => false,
                    'message' => 'Você deve aceitar os termos de uso'
                ], 400);
            }

            // Cria o usuário
            $user = User::create([
                'usr_first_name' => $request->usr_first_name,
                'usr_last_name' => $request->usr_last_name,
                'usr_identity' => $request->usr_identity,
                'usr_email' => $request->usr_email,
                'usr_password' => Hash::make($request->usr_password),
                'usr_terms_accept' => $request->usr_terms_accept,
                'usr_status' => 'active' // Definindo status padrão
            ]);

            // Gera token de acesso
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'message' => 'Usuário criado com sucesso!'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erro no registro: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    /**
     * LOGIN - Autentica um usuário existente
     * Para que serve: Verifica credenciais e retorna token se válidas
     * Retorna: Token de acesso + dados do usuário
     */
    public function login(Request $request)
    {
        try {
            // Validação básica
            $request->validate([
                'usr_email' => 'required|email',
                'usr_password' => 'required',
            ]);

            // Tenta autenticar
            if (
                !Auth::attempt([
                    'usr_email' => $request->usr_email,
                    'password' => $request->usr_password
                ])
            ) {
                throw ValidationException::withMessages([
                    'usr_email' => ['Credenciais inválidas'],
                ]);
            }

            // Busca o usuário
            $user = User::where('usr_email', $request->usr_email)->firstOrFail();

            // Verifica status do usuário
            if ($user->usr_status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Sua conta está inativa'
                ], 403);
            }

            // Gera token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erro no login: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro na autenticação'
            ], 500);
        }
    }


    /**
     * LOGOUT - Revoga o token atual do usuário
     * Para que serve: Invalida o token atual para fazer logout
     * Retorna: Mensagem de sucesso
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro no logout: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fazer logout'
            ], 500);
        }
    }

    /**
     * ME - Retorna dados do usuário autenticado
     * Para que serve: Permite o Angular verificar se o token ainda é válido
     * Retorna: Dados do usuário logado
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não autenticado'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao buscar usuário: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar dados do usuário'
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
            DB::select('SELECT 1');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}