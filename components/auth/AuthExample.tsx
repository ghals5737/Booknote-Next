'use client';

import { useNextAuth } from '@/hooks/use-nextauth';
import React, { useState } from 'react';

export default function AuthExample() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, register, logout, isAuthenticated } = useNextAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result: { success: boolean; error?: string } | undefined;
      if (isLogin) {
        result = await login(email, password) as { success: boolean; error?: string };
      } else {
        result = await register(email, password, name) as { success: boolean; error?: string };
      }

      if (result?.success) {
        setMessage(isLogin ? '로그인 성공!' : '회원가입 성공!');
        // 성공 시 대시보드로 리다이렉트
        // router.push('/dashboard');
      } else {
        setMessage(result?.error || '오류가 발생했습니다');
      }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다');
      console.error('오류가 발생했습니다', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setMessage('로그아웃 성공!');
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      setMessage('로그아웃 중 오류가 발생했습니다');
      console.error('오류가 발생했습니다', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">로그인됨</h2>
        <p className="text-gray-600 mb-4 text-center">성공적으로 로그인되었습니다!</p>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '로그아웃 중...' : '로그아웃'}
        </button>
        {message && (
          <p className={`mt-4 text-center ${message.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? '로그인' : '회원가입'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="user@example.com"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="홍길동"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
            setEmail('');
            setPassword('');
            setName('');
          }}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>

      {message && (
        <p className={`mt-4 text-center ${message.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
