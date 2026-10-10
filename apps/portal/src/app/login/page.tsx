'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { ApiAuthRepository } from '../../infrastructure/repositories/ApiAuthRepository';
import { InputField, Button } from '@apisit110/pos-ui';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const repository = new ApiAuthRepository();
    const useCase = new LoginUseCase(repository);

    try {
      await useCase.execute(username, pin);
      router.push('/dashboard');
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.res_desc?.th;
      if (message) {
        setError(message);
      } else if (status === 429) {
        setError('พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง');
      } else {
        setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left 50% */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Please enter your details</p>
          
          <form onSubmit={handleLogin}>
            <InputField
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <InputField
              label="Pin"
              type="password"
              placeholder="••••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />

            {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

            <Button type="submit">Sign In</Button>
          </form>
        </div>
      </div>

      {/* Right 50% */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: '1.5rem',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem'
        }}></div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Lightning POS</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px' }}>
          Empower your business with the most advanced point-of-sale service center.
        </p>
      </div>
    </div>
  );
}
