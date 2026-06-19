import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { AuthState } from '../hooks/useAuth';

interface AuthDialogProps {
  open: boolean;
  auth: AuthState;
  onAuthenticated: () => void;
}

interface FormValues {
  username: string;
  password: string;
}

function AuthForm({
  mode,
  auth,
  onSuccess,
}: {
  mode: 'signin' | 'signup';
  auth: AuthState;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    auth.clearError();
    const ok =
      mode === 'signup'
        ? await auth.signup(values.username, values.password)
        : await auth.signin(values.username, values.password);
    if (ok) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-1">
        <Label htmlFor={`${mode}-username`}>Username</Label>
        <Input
          id={`${mode}-username`}
          autoComplete="username"
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          {...register('password', { required: 'Password is required', minLength: { value: 3, message: 'At least 3 characters' } })}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      {auth.error && <p className="text-sm text-red-600">{auth.error}</p>}
      <Button
        type="submit"
        disabled={auth.isLoading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {auth.isLoading
          ? mode === 'signup' ? 'Creating account…' : 'Signing in…'
          : mode === 'signup' ? 'Create Account' : 'Sign In'}
      </Button>
    </form>
  );
}

export function AuthDialog({ open, auth, onAuthenticated }: AuthDialogProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAuthenticated = () => {
    setShowForm(false);
    onAuthenticated();
  };

  const handleGuest = () => {
    auth.playAsGuest();
    onAuthenticated();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-900 text-center">
            🏴‍☠️ Treasure Hunt
          </DialogTitle>
          <DialogDescription className="text-center text-amber-700">
            Sign in to save your scores, or play as a guest.
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="flex flex-col gap-3 mt-2">
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-base py-5"
              onClick={() => setShowForm(true)}
            >
              Sign In / Create Account
            </Button>
            <Button
              variant="outline"
              className="w-full text-base py-5 border-amber-400 text-amber-800 hover:bg-amber-50"
              onClick={handleGuest}
            >
              Play as Guest
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="signin" onValueChange={() => auth.clearError()}>
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <AuthForm mode="signin" auth={auth} onSuccess={handleAuthenticated} />
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm mode="signup" auth={auth} onSuccess={handleAuthenticated} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
