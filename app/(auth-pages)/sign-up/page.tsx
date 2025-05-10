'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '@/app/components/ui/formField';
import Form from '@/app/components/form';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';
import { loginServer } from '@/app/constants';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated based on admin status
    if (isAuthenticated && user) {
      router.push(user.admin ? '/admin-dashboard' : '/user-panel');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate inputs
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`${loginServer}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password, admin: isAdmin }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Login with the received token
      const token = data.access_tokens[0].access_token.toString();
      login(token);

      toast.success('Registration successful!');
      
      // Decode token to get user data for redirection
      const userData = JSON.parse(atob(token.split('.')[1]));
      router.push(userData.admin ? '/admin-dashboard' : '/user-panel');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <FormInfo isSignUp />
      <Form onSubmit={handleSubmit}>
        {error && (
          <div className='p-3 mb-4 text-sm rounded bg-red-100 text-red-800'>
            {error}
          </div>
        )}
        <FormField
          id='email'
          text='Email'
          value={email}
          setValue={setEmail}
          placeholder='name@example.com'
          type='email'
        />
        <FormField
          id='password'
          text='Password'
          value={password}
          setValue={setPassword}
          type='password'
        />
        <FormField
          id='confirmPassword'
          text='Confirm password'
          value={confirmPassword}
          setValue={setConfirmPassword}
          type='password'
        />
        <div className='flex items-center gap-2 mb-4'>
          <input
            type='checkbox'
            id='admin'
            name='Admin'
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className='h-4 w-4 rounded border-primary-border text-teal-600 focus:ring-teal-500'
          />
          <label htmlFor='admin' className='text-sm lg:text-base'>
            Is Admin
          </label>
        </div>
        <FormActions isLoading={isLoading} isSignUp />
      </Form>
    </AuthFormWrapper>
  );
}
