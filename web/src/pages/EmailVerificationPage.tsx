import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface VerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  organization?: any;
  error?: {
    code: string;
    message: string;
  };
}

const EmailVerificationPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      setError('');
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      setTimeout(() => {
        handleVerify(pastedData);
      }, 100);
    }
  };

  const handleVerify = async (codeString: string) => {
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          code: codeString
        })
      });

      const data: VerificationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Verification failed');
      }

      // Success!
      setSuccess(true);
      
      // Store auth data
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('organization', JSON.stringify(data.organization));
      }

      // Redirect to onboarding after 1.5 seconds
      setTimeout(() => {
        const orgType = data.organization?.type;
        if (orgType === 'CARRIER') {
          navigate('/onboarding/carrier');
        } else if (orgType === 'SHIPPER' || orgType === 'BOTH') {
          navigate('/onboarding/customer');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.secondsRemaining) {
          setResendCooldown(data.error.secondsRemaining);
        }
        throw new Error(data.error?.message || 'Failed to resend code');
      }

      // Success - start cooldown
      setResendCooldown(60);
      setCanResend(false);
      
      // Clear current code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (err: any) {
      console.error('❌ Resend error:', err);
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: theme.colors.backgroundCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '20px' }} />
          <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', marginBottom: '10px' }}>
            Email Required
          </h2>
          <p style={{ color: theme.colors.textSecondary, marginBottom: '30px' }}>
            Please return to the signup page.
          </p>
          <button
            onClick={() => navigate('/splash')}
            style={{
              background: theme.colors.primary,
              color: '#000',
              padding: '12px 30px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: theme.colors.backgroundCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          background: success ? theme.colors.success : theme.colors.primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          {success ? (
            <CheckCircle size={40} color="#000" />
          ) : (
            <Mail size={40} color="#000" />
          )}
        </div>

        {/* Title */}
        <h1 style={{
          color: theme.colors.textPrimary,
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px'
        }}>
          {success ? 'Email Verified!' : 'Check Your Email'}
        </h1>

        {/* Description */}
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: '16px',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          {success ? (
            <>Redirecting you to complete your account setup...</>
          ) : (
            <>
              We've sent a verification code to<br />
              <strong style={{ color: theme.colors.primary }}>{email}</strong>
            </>
          )}
        </p>

        {!success && (
          <>
            {/* Code Inputs */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  style={{
                    width: '60px',
                    height: '70px',
                    fontSize: '32px',
                    fontWeight: '700',
                    textAlign: 'center',
                    border: `2px solid ${error ? theme.colors.error : theme.colors.border}`,
                    borderRadius: '12px',
                    background: theme.colors.background,
                    color: theme.colors.textPrimary,
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: isVerifying ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? theme.colors.error : theme.colors.border;
                  }}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: `${theme.colors.error}20`,
                border: `1px solid ${theme.colors.error}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
              }}>
                <AlertCircle size={18} color={theme.colors.error} />
                <span style={{ color: theme.colors.error, fontSize: '14px' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Verifying State */}
            {isVerifying && (
              <p style={{
                color: theme.colors.textSecondary,
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                Verifying code...
              </p>
            )}

            {/* Resend Button */}
            <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: `1px solid ${theme.colors.border}` }}>
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px', marginBottom: '15px' }}>
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                style={{
                  background: 'transparent',
                  color: canResend ? theme.colors.primary : theme.colors.textSecondary,
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${canResend ? theme.colors.primary : theme.colors.border}`,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: canResend && !isResending ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (canResend && !isResending) {
                    e.currentTarget.style.background = theme.colors.primary;
                    e.currentTarget.style.color = '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canResend) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.colors.primary;
                  }
                }}
              >
                <RefreshCw size={16} />
                {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Help Text */}
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '12px',
              marginTop: '30px'
            }}>
              Code expires in 15 minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;



