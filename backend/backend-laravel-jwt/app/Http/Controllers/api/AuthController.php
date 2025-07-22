<?php
//Http/Controllers/AuthControler.php
namespace App\Http\Controllers\Api;

use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PDOException;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Registro de novo usuário e emissão de JWT como cookie
    public function register(Request $request)
    {
        $data = $request->all();
        if (!empty($data['usr_birth_date'])) {
            $data['usr_birth_date'] = Carbon::parse($data['usr_birth_date'])->format('Y-m-d');
        }

        $validator = Validator::make($data, [
            'usr_first_name' => 'required|string|max:255',
            'usr_last_name' => 'required|string|max:255',
            'usr_cpf' => 'required|string|max:20|unique:usr_user,usr_cpf',
            'usr_email' => 'required|email|unique:usr_user,usr_email',
            'usr_password' => 'required|confirmed|min:6',
            'usr_terms_accept' => 'required|boolean|in:1,true',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = UserModel::create([
            'usr_first_name' => $data['usr_first_name'],
            'usr_last_name' => $data['usr_last_name'],
            'usr_cpf' => $data['usr_cpf'],
            'usr_email' => $data['usr_email'],
            'password' => Hash::make($data['usr_password']),
            'usr_phone' => $data['usr_phone'] ?? null,
            'usr_birth_date' => $data['usr_birth_date'] ?? null,
            'usr_address' => $data['usr_address'] ?? null,
            'usr_terms_accept' => true,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(['user' => $user])->withCookie(cookie('token', $token, 60, '/', null, true, true, false, 'Strict'));
    }

    // Login e envio do JWT via HttpOnly cookie
    public function login(Request $request)
    {
        try {
            DB::connection()->getPdo();

            $credentials = [
                'usr_cpf' => $request->get('usr_cpf'),
                'password' => $request->get('password')
            ];

            $user = UserModel::where('usr_cpf', $request->get('usr_cpf'))->first();
            if (!$user) {
                return response()->json([
                    'error_type' => 'user_not_found',
                    'error_title' => 'Usuário não encontrado',
                    'error_message' => 'O CPF informado não está cadastrado.'
                ], 404);
            }

            if (!$token = auth('api')->attempt($credentials)) {
                return response()->json([
                    'error_type' => 'invalid_credentials',
                    'error_title' => 'Credenciais inválidas',
                    'error_message' => 'CPF ou senha incorretos.'
                ], 401);
            }

            return response()->json(['message' => 'Login bem-sucedido'])->withCookie(cookie('token', $token, 60, '/', null, true, true, false, 'Strict'));
        } catch (Exception $e) {
            Log::error('Erro no login: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'database_error',
                'error_title' => 'Erro',
                'error_message' => 'Não foi possível conectar.'
            ], 500);
        }
    }

    // Logout - remove o cookie JWT
    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logout realizado'])->withCookie(Cookie::forget('token'));
    }

    // Retorna dados do usuário logado (via token do cookie)
    public function me()
    {
        try {
            $user = auth('api')->user();
            if ($user->usr_birth_date) {
                $user->usr_birth_date = Carbon::parse($user->usr_birth_date)->toIso8601String();
            }
            return response()->json($user);
        } catch (Exception $e) {
            Log::error('Erro ao obter dados do usuário: ' . $e->getMessage());
            return response()->json(['message' => 'Erro ao buscar usuário'], 500);
        }
    }

    // Atualiza dados do usuário autenticado
    public function updateUser(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json([
                    'error_type' => 'unauthenticated',
                    'error_title' => 'Não autenticado',
                    'error_message' => 'Você precisa estar logado para atualizar seus dados.'
                ], 401);
            }

            $data = $request->all();
            if (!empty($data['usr_birth_date'])) {
                $data['usr_birth_date'] = Carbon::parse($data['usr_birth_date'])->format('Y-m-d');
            }

            $validator = Validator::make($data, [
                'usr_password' => 'required|string',
                'usr_first_name' => 'required|string|max:255',
                'usr_last_name' => 'required|string|max:255',
                'usr_cpf' => 'required|string|max:20|unique:usr_user,usr_cpf,' . $user->usr_id . ',usr_id',
                'usr_email' => 'required|email|unique:usr_user,usr_email,' . $user->usr_id . ',usr_id',
                'usr_phone' => 'nullable|string|max:20',
                'usr_birth_date' => 'nullable|date',
                'usr_address' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            if (!Hash::check($data['usr_password'], $user->password)) {
                return response()->json([
                    'error_type' => 'invalid_password',
                    'error_title' => 'Senha incorreta',
                    'error_message' => 'A senha atual fornecida está incorreta.'
                ], 403);
            }

            $user->usr_first_name = $data['usr_first_name'];
            $user->usr_last_name = $data['usr_last_name'];
            $user->usr_cpf = $data['usr_cpf'];
            $user->usr_email = $data['usr_email'];
            $user->usr_phone = $data['usr_phone'] ?? null;
            $user->usr_birth_date = $data['usr_birth_date'] ?? null;
            $user->usr_address = $data['usr_address'] ?? null;
            $user->save();

            return response()->json($user);

        } catch (Exception $e) {
            Log::error('Erro ao atualizar usuário: ' . $e->getMessage());
            return response()->json([
                'error_type' => 'update_error',
                'error_title' => 'Erro ao atualizar',
                'error_message' => 'Não foi possível atualizar os dados do usuário.'
            ], 500);
        }
    }

    // Atualiza o token JWT (caso o frontend implemente refresh)
    public function refresh()
    {
        try {
            $newToken = auth('api')->refresh();
            return response()->json(['message' => 'Token atualizado'])->withCookie(cookie('token', $newToken, 60, '/', null, true, true, false, 'Strict'));
        } catch (Exception $e) {
            Log::error('Erro ao atualizar token: ' . $e->getMessage());
            return response()->json(['message' => 'Erro ao atualizar token'], 500);
        }
    }
}