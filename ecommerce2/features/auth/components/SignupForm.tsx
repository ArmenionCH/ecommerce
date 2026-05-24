'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '../authClient';

const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['customer', 'seller'] as const),
});

type SignupSchema = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

export function SignupForm({ onSuccess, onToggleForm }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await signUp(data.email, data.password, data.fullName, data.role);
      if (res.success) {
        setSuccessMsg('Account created successfully! Please check your email to verify (or proceed to sign in if auto-confirmed).');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-sm text-gray-500 mt-2">Create your MarketHub account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
          <Input
            type="text"
            placeholder="Juan Dela Cruz"
            error={!!errors.fullName}
            disabled={isLoading}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-500 font-medium">{errors.fullName.message}</p>
          )}
        </div>

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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">I want to:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setValue('role', 'customer')}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedRole === 'customer'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
              }`}
            >
              Shop as buyer
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setValue('role', 'seller')}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedRole === 'seller'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
              }`}
            >
              Sell products
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 mt-3" disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {onToggleForm && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={onToggleForm} className="text-emerald-600 font-semibold hover:underline bg-transparent border-0 cursor-pointer">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}
