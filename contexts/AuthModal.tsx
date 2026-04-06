import React, { createContext, useCallback, useContext, useState } from 'react';

interface AuthModalContextValue {
  visible: boolean;
  show: (reason?: string) => void;
  hide: () => void;
  reason: string;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  visible: false,
  show: () => {},
  hide: () => {},
  reason: '',
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState('');

  const show = useCallback((r = '') => {
    setReason(r);
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <AuthModalContext.Provider value={{ visible, show, hide, reason }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
