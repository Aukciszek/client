'use client';

import { type FormEvent, useState } from 'react';
import Form from '@/app/components/form';
import FormField from '@/app/components/ui/formField';
import FormActions from '@/app/components/form/formActions';
import FormInfo from '@/app/components/form/formInfo';
import AuthFormWrapper from '@/app/components/authFormWrapper';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <FormInfo forgotPassword />
      <Form onSubmit={handleSubmit}>
        <FormField
          id='email'
          text='Email'
          value={email}
          setValue={setEmail}
          placeholder='name@example.com'
          type='email'
        />
        <FormActions isLoading={isLoading} forgotPassowrd />
      </Form>
    </AuthFormWrapper>
  );
}
