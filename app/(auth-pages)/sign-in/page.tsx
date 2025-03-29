'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '@/app/components/form';
import FormField from '@/app/components/ui/formField';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === 'admin@example.com' && password === 'password') {
        router.push('/admin-dashboard');
      } else if (email && password) {
        router.push('/user-panel');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <FormInfo isSignIn />
      <Form onSubmit={handleSubmit}>
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
