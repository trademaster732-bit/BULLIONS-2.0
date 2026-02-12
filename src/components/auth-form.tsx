'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthError,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from '@/lib/types';
import { setDoc } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, values.email, values.password);
          toast({ title: 'Login Successful', description: 'Welcome back!' });
          router.push('/dashboard');
        } else {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );
          const firebaseUser = userCredential.user;

          // Create user document in Firestore
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          
          let newUser: User;
          
          // Updated to handle admin@bot.com for admin role
          if (values.email.toLowerCase() === 'admin@bot.com') {
            newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: 'Admin',
              role: 'ADMIN',
              createdAt: new Date().toISOString(),
            };
          } else if (values.email.toLowerCase() === 'bullions@bot.com') {
            newUser = {
              id: firebaseUser.uid,
              email: "bullions@bot.com",
              name: "BULLIONS BOT Admin",
              role: "ADMIN",
              createdAt: new Date().toISOString(),
            };
          } else {
            newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email?.split('@')[0] || 'New User',
              role: 'FREE_USER',
              createdAt: new Date().toISOString(),
            };
          }

          // Use blocking setDoc here to ensure user doc is created before proceeding
          await setDoc(userDocRef, newUser, { merge: true });

          toast({
            title: 'Registration Successful',
            description: 'Your account has been created.',
          });
          router.push('/dashboard');
        }
      } catch (error) {
        const authError = error as AuthError;
        let errorMessage = 'An unexpected error occurred. Please try again.';
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists.';
            break;
          case 'auth/weak-password':
            errorMessage =
              'The password is too weak. Please use a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
        }
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: errorMessage,
        });
      }
    });
  };

  const handlePasswordReset = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your inbox for instructions to reset your password.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Password Reset Failed',
          description: 'Could not send reset email. Please check the email address.',
        });
      }
    });
  };

  return (
    <Card className="glass-card shadow-2xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">
          {isLogin ? 'Trader Login' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email here"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Enter Your Password here"
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLogin && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={handlePasswordReset}
                  disabled={isPending}
                >
                  Forgot Password?
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              disabled={isPending}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
