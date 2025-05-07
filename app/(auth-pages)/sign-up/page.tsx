'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackLink from '@/app/components/ui/backLink';
import FormField from '@/app/components/ui/formField';
import Form from '@/app/components/form';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/user-panel');
    }
  }, [isAuthenticated, router]);

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
      // Replace with your actual API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // For demo purposes, use mock JWT when API is not available
      const mockJwt = mockAuthResponse(email, fullName);

      // Login with the received token (or mock token)
      login(data.token || mockJwt);

      toast.success('Registration successful!');
      router.push('/user-panel');
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

  // Temporary function to create mock JWT tokens for demo purposes
  const mockAuthResponse = (email: string, fullName: string) => {
    // Create payload with user information based on email
    const isAdmin = email === 'admin@example.com';
    const payload = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      fullName,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
    };

    // Encode payload to base64
    const encodedPayload = btoa(JSON.stringify(payload));

    // Create a simple mock JWT (not secure, just for demo)
    return `header.${encodedPayload}.signature`;
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
          id='fullName'
          text='Full name'
          value={fullName}
          setValue={setFullName}
          placeholder='John Doe'
          type='text'
        />
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
        <FormActions isLoading={isLoading} isSignUp />
      </Form>
    </AuthFormWrapper>
  );
}
