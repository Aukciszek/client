'use client';

import { type FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Form from '@/app/components/form';
import FormField from '@/app/components/ui/formField';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

export default function SigninPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/user-panel');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // For demo purposes, use mock JWT when API is not available
      const mockJwt = mockAuthResponse(email);

      // Login with the received token (or mock token)
      login(data.token || mockJwt);

      // Show success message
      toast.success('Login successful!');

      // Redirect based on user role
      if (email === 'admin@example.com') {
        router.push('/admin-dashboard');
      } else {
        router.push('/user-panel');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary function to create mock JWT tokens for demo purposes
  const mockAuthResponse = (email: string) => {
    // Create payload with user information based on email
    const isAdmin = email === 'admin@example.com';
    const payload = {
      id: isAdmin ? 'admin-123' : 'user-456',
      email,
      fullName: isAdmin ? 'Admin User' : 'Regular User',
      role: isAdmin ? 'admin' : 'user',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
    };

    // Encode payload to base64
    const encodedPayload = btoa(JSON.stringify(payload));

    // Create a simple mock JWT (not secure, just for demo)
    return `header.${encodedPayload}.signature`;
  };

  return (
    <AuthFormWrapper>
      <FormInfo isSignIn />
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
          forgotPassowrd
        />
        <FormActions isLoading={isLoading} isSignIn />
      </Form>
    </AuthFormWrapper>
  );
}
