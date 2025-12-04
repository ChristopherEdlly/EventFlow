import { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '../services/googleAuth';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onSkip?: () => void;
}

export default function EmailVerification({ email, onVerified, onSkip }: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);
    setError(null);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verifyEmail(verificationCode);
      if (result.emailVerified) {
        setSuccess(true);
        setTimeout(onVerified, 1500);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);

    try {
      await resendVerificationCode();
      setCountdown(60); // 60 seconds cooldown
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">Email verificado!</h3>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <Mail className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Verifique seu email</h2>
        <p className="mt-2 text-gray-600">
          Enviamos um código de 6 dígitos para
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      {/* Code inputs */}
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={loading}
            className={`h-14 w-12 rounded-lg border-2 text-center text-2xl font-bold transition-colors
              ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'}
              ${loading ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}
              focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Verify button */}
      <button
        onClick={() => handleVerify()}
        disabled={loading || code.some(d => !d)}
        className="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Verificando...
          </span>
        ) : (
          'Verificar código'
        )}
      </button>

      {/* Resend button */}
      <div className="text-center">
        <p className="text-sm text-gray-600">Não recebeu o código?</p>
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
          {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
        </button>
      </div>

      {/* Skip option */}
      {onSkip && (
        <div className="border-t border-gray-200 pt-4 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Verificar depois
          </button>
        </div>
      )}
    </div>
  );
}
