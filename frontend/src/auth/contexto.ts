import { createContext, use } from 'react';
import type { Credenciais } from '../api/tipos';

export interface Autenticacao {
  token: string | null;
  autenticado: boolean;
  entrar: (credenciais: Credenciais) => Promise<void>;
  cadastrar: (nome: string, credenciais: Credenciais) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<Autenticacao | null>(null);

export function useAuth(): Autenticacao {
  const contexto = use(AuthContext);
  if (contexto === null) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return contexto;
}
