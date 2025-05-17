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
import { loginServer } from '@/app/constants';
import { getTokensList } from '@/app/utils/auth';

export default function SigninPage() {
  const router = useRouter();
  const { login, loginValidation, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated based on admin status
    if (isAuthenticated && user) {
      router.push(user.admin ? '/admin-dashboard' : '/user-panel');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${loginServer}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) { 
        throw new Error(data.detail || 'Invalid credentials');
      }

      // Login with the received token and get user data
      console.log('Login response:', data);
      const token = data.access_tokens[0].access_token.toString();
      const serverTokens = data.access_tokens;
      console.log('Server tokens:', encodeURIComponent(JSON.stringify(serverTokens)), ' ', typeof JSON.stringify(serverTokens));
      login(token);
      loginValidation(token,serverTokens);
      console.log('Tokens list:', getTokensList());
      console.log('User data:', user);
      
      toast.success('Login successful!');

      // Decode token to get user data for redirection
      const userData = JSON.parse(atob(token.split('.')[1]));
      router.push(userData.admin ? '/admin-dashboard' : '/user-panel');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
function loginValidation(token: any) {
  throw new Error('Function not implemented.');
}

