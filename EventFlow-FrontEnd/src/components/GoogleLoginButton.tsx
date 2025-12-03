import { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { getGoogleConfig, authenticateWithGoogle } from '../services/googleAuth';

interface GoogleLoginButtonProps {
  onSuccess: (response: { id: string; name: string; email: string; token: string }) => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    loadGoogleConfig();
  }, []);

  const loadGoogleConfig = async () => {
    try {
      const config = await getGoogleConfig();
      if (config.configured && config.clientId) {
        setClientId(config.clientId);
      }
    } catch (err) {
      console.error('Erro ao carregar configuração do Google:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      onError?.('Token do Google não recebido');
      return;
    }

    setAuthenticating(true);
    try {
      const response = await authenticateWithGoogle(credentialResponse.credential);
      onSuccess({
        id: response.id,
        name: response.name,
        email: response.email,
        token: response.token,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      onError?.(error.message || 'Erro ao autenticar com Google');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleError = () => {
    onError?.('Erro ao fazer login com Google');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
      </div>
    );
  }

  if (!clientId) {
    // Google não configurado - não mostrar botão
    return null;
  }

  if (authenticating) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        <span>Autenticando...</span>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          locale="pt-BR"
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
