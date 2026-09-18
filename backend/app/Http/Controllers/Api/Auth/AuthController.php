<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return $this->error('Identifiants incorrects.', 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('peci-'.Str::random(8))->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'member_id' => $user->member?->id,
            ],
        ], 'Connexion réussie.');
    }

    public function logout()
    {
        $user = request()->user();
        $user?->currentAccessToken()?->delete();

        return $this->success(null, 'Déconnexion réussie.');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->error("Impossible d'envoyer le lien de réinitialisation.", 422);
        }

        return $this->success(null, 'Un lien de réinitialisation a été envoyé si cette adresse existe.');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->update(['password' => $password]);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error('Le lien de réinitialisation est invalide ou expiré.', 422);
        }

        return $this->success(null, 'Mot de passe réinitialisé avec succès.');
    }
}
