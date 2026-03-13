'use client';

import { AuthProvider } from '@/context/AuthContext';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'var(--Outfit-font, inherit)',
        }}
      />
    </AuthProvider>
  );
}
