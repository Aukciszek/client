'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackLink from '@/app/components/ui/backLink';
import FormField from '@/app/components/ui/formField';
import Form from '@/app/components/form';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === 'admin@example.com' && password === 'password') {
        router.push('/dashboard');
      } else if (email && password) {
        router.push('/auction');
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
      <FormInfo isSignUp />
      <Form onSubmit={handleSubmit}>
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
