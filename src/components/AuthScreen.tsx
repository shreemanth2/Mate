import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { LogIn } from 'lucide-react';

interface AuthScreenProps {
  onComplete: () => void;
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessOpen, setForgotSuccessOpen] = useState(false);
  const [isInvalidEmailOpen, setIsInvalidEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = (via: 'email' | 'google') => {
    // For email flows, require valid email format
    if (via === 'email') {
      const emailRegexLocal = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegexLocal.test(email)) {
        setIsInvalidEmailOpen(true);
        return;
      }
    }
    if (via === 'google') {
      // Prefer using a real OAuth redirect flow: the popup should redirect to /auth-callback.html on our origin
      const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
      const redirectUri = `${window.location.origin}/auth-callback.html`;

      let oauthUrl = '';
      if (clientId) {
        oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
      } else {
        // Fallback to AccountChooser which will not redirect back; advising user to configure VITE_GOOGLE_CLIENT_ID
        oauthUrl = 'https://accounts.google.com/AccountChooser?continue=https://www.google.com';
      }

      setLoading(true);
      setMessage('Opening Google...');
      const popup = window.open(oauthUrl, 'googleAuth', 'width=600,height=700');
      if (!popup) {
        setMessage('Popup blocked. Please allow popups and try again.');
        setLoading(false);
        return;
      }

      // Wait for a postMessage from the callback page. The callback page must postMessage({ type: 'google-auth', success: true }) to window.opener.
      const onMessage = (ev: MessageEvent) => {
        if (!ev.data) return;
        if (ev.data.type === 'google-auth' && ev.data.success) {
          window.removeEventListener('message', onMessage);
          try { popup.close(); } catch (e) {}
          setMessage('Proceeding securely...');
          setTimeout(() => { setLoading(false); setMessage(''); onComplete(); }, 900);
        }
      };

      window.addEventListener('message', onMessage);

      // Fallback: if popup is closed without a message, do not proceed
      const closedInterval = window.setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(closedInterval);
            window.removeEventListener('message', onMessage);
            setLoading(false);
            setMessage('Popup closed. Sign in was not completed.');
          }
        } catch (e) {
          // ignore
        }
      }, 500);

      return;
    }

    // Email flow simulation
    setLoading(true);
    const label = mode === 'login' ? 'Securely logging in' : 'Signing you up';
    setMessage(label + '...');

    // Simulate network/auth delay
    setTimeout(() => {
      setLoading(false);
      setMessage('');
      onComplete();
    }, 1400);
  };

  const passwordValid = password.length >= 6;
  const passwordsMatch = mode === 'login' ? true : password === confirmPassword;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const emailValid = emailRegex.test(email);
  const canSubmitEmail = !loading && emailValid && passwordValid && passwordsMatch;

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Remove any absolutely-positioned left icons that might be injected by shared UI primitives
    const root = containerRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.absolute.left-3, .absolute.left-4, .absolute.left-2');
    els.forEach((el) => {
      try { el.remove(); } catch (e) { /* ignore */ }
    });
  }, []);

  return (
    <div ref={containerRef} className="auth-screen h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-lg border border-[#8B4513]/10 flex flex-col"
        style={{ width: 'min(90vw, 700px)', height: 'min(90vw, 700px)' }}
      >
        {/* Inner scrollable content */}
        <div className="p-6 flex-1 overflow-auto">
          <div className="text-center mb-4">
            <h1 className="text-[48px] font-bold">Login / SignUp</h1>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
            <div className="text-sm text-muted-foreground">{mode === 'login' ? 'Welcome back' : 'Join Mate'}</div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg ${mode === 'login' ? 'bg-[#DC143C] text-white' : 'bg-white border border-[#8B4513]/10'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-lg ${mode === 'signup' ? 'bg-[#DC143C] text-white' : 'bg-white border border-[#8B4513]/10'}`}>
              Sign Up
            </button>
          </div>

          {!forgotMode ? (
          <div className="space-y-3">
            <Input placeholder="Email" value={email} onChange={(e:any) => setEmail(e.target.value)} />

            <div>
              <Input placeholder="Password" type="password" value={password} onChange={(e:any) => setPassword(e.target.value)} />
            </div>

            {mode === 'login' && (
              <div className="flex justify-end mt-2">
                <button onClick={() => { setForgotMode(true); setForgotEmail(email); }} className="text-sm text-[#DC143C] hover:underline">Forgot password?</button>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <Input placeholder="Confirm password" type="password" value={confirmPassword} onChange={(e:any) => setConfirmPassword(e.target.value)} />
                <div className="mt-1 text-sm">
                  {!passwordValid && password.length > 0 && (
                    <div className="text-red-600">Password must be at least 6 characters</div>
                  )}
                  {passwordValid && confirmPassword.length > 0 && !passwordsMatch && (
                    <div className="text-red-600">Passwords do not match</div>
                  )}
                </div>
              </div>
            )}
          </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reset your password</h3>
              <p className="text-sm text-muted-foreground">Enter your email and we'll send a password reset link.</p>
              <Input placeholder="Email" value={forgotEmail} onChange={(e:any) => setForgotEmail(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setForgotMode(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!forgotEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) { setIsInvalidEmailOpen(true); return; }
                  // simulate sending email
                  setForgotSuccessOpen(true);
                }}>Submit</Button>
              </div>

              {/* Success popup */}
              {forgotSuccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-[#8B4513]/20 w-full max-w-md text-center">
                    <h4 className="text-lg font-semibold mb-2">Password Reset email sent successfully</h4>
                    <p className="text-sm text-muted-foreground mb-4">Check your inbox for the reset link.</p>
                    <div className="flex justify-center">
                      <Button onClick={() => { setForgotSuccessOpen(false); setForgotMode(false); setMessage(''); }} className="bg-[#8B4513] text-white">Back to login</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <Button onClick={() => submit('email')} className="w-full py-3" disabled={!canSubmitEmail}>
              {loading ? (
                <span className="flex items-center justify-center gap-2"><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>{mode === 'login' ? 'Securely logging in' : 'Signing you up'}</span>
              ) : (
                <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
              )}
            </Button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/30" />
            <div className="text-sm text-muted-foreground">or</div>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          <div>
            <button onClick={() => submit('google')} className="w-full py-3 rounded-lg border border-[#8B4513]/10 bg-white flex items-center justify-center gap-2">
              <LogIn size={18} />
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>
          </div>

          {/* message display removed — status shown on buttons only */}
          {/* Invalid email popup */}
          <AlertDialog open={isInvalidEmailOpen} onOpenChange={(open:boolean) => setIsInvalidEmailOpen(open)}>
            <AlertDialogContent className="bg-white border-[#8B4513]/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-primary">Enter valid email</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">Please provide a valid email address.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => setIsInvalidEmailOpen(false)}>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
