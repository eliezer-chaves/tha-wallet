<?php

namespace App\Http\Controllers\Api;

use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->all();

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
            'usr_password' => Hash::make($data['usr_password']),
            'usr_phone' => $data['usr_phone'] ?? null,
            'usr_birth_date' => $data['usr_birth_date'] ?? null,
            'usr_address' => $data['usr_address'] ?? null,
            'usr_terms_accept' => true,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function login(Request $request)
    {
        $credentials = [
            'usr_cpf' => $request->get('usr_cpf'),
            'usr_password' => $request->get('password')
        ];

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid CPF or password'], 401);
        }

        return response()->json(['token' => $token]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out']);
    }

    public function refresh()
    {
        return response()->json(['token' => auth('api')->refresh()]);
    }
}
