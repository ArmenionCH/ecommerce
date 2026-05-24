'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '../actions';

const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SigninSchema = z.infer<typeof signinSchema>;

interface SigninFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

export function SigninForm({ onSuccess, onToggleForm }: SigninFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninSchema>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn(data.email, data.password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-2">Sign in to your Green Market account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
          <Input
            type="email"
            placeholder="you@example.com"
            error={!!errors.email}
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            error={!!errors.password}
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {onToggleForm && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <button onClick={onToggleForm} className="text-emerald-600 font-semibold hover:underline bg-transparent border-0 cursor-pointer">
            Create Account
          </button>
        </div>
      )}
    </div>
  );
}
