import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NeoButton } from '@/components/ui/neo-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthMode = 'login' | 'signup' | 'magic-link';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, signInWithMagicLink, loading } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in (handle redirect param)
  useEffect(() => {
    if (user && !loading) {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/';
      navigate(redirectUrl);
    }
  }, [user, loading, navigate]);

  const validateEmail = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: 'Invalid Email',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      toast({
        title: 'Invalid Password',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail() || (mode !== 'magic-link' && !validatePassword())) return;

    setIsSubmitting(true);

    try {
      if (mode === 'magic-link') {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        toast({
          title: 'Magic Link Sent!',
          description: 'Check your email for the login link.',
        });
        return;
      }

      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast({
            title: 'Account Exists',
            description: 'This email is already registered. Try logging in instead.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Invalid Credentials',
            description: 'The email or password you entered is incorrect.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      if (mode === 'signup') {
        toast({
          title: 'Account Created!',
          description: 'Welcome to PassportPop!',
        });
      }
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg font-heading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-4 border-primary p-4">
        <div className="container mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-accent transition-colors border-2 border-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-2xl font-bold">PassportPop</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="border-4 border-primary bg-card p-8 shadow-brutal">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-highlight px-4 py-2 border-2 border-primary mb-4">
                <Sparkles className="h-5 w-5" />
                <span className="font-heading font-bold">2 FREE DOWNLOADS</span>
              </div>
              <h2 className="font-heading text-3xl font-bold">
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Magic Link'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {mode === 'login' 
                  ? 'Sign in to access your passport photos' 
                  : mode === 'signup' 
                    ? 'Join to get 2 free photo downloads'
                    : 'We\'ll email you a login link'}
              </p>
            </div>

            {/* Google OAuth */}
            <NeoButton
              type="button"
              variant="outline"
              className="w-full mb-4"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </NeoButton>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-primary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground font-medium">or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-heading font-bold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-2 border-primary h-12"
                    required
                  />
                </div>
              </div>

              {mode !== 'magic-link' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-heading font-bold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-2 border-primary h-12"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <NeoButton
                type="submit"
                variant="default"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : 
                  mode === 'login' ? 'Sign In' : 
                  mode === 'signup' ? 'Create Account' : 
                  'Send Magic Link'}
              </NeoButton>
            </form>

            {/* Mode Switchers */}
            <div className="mt-6 space-y-3 text-center">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('magic-link')}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Sign in with magic link instead
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-bold text-foreground underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-foreground underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
              {mode === 'magic-link' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Back to password sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
