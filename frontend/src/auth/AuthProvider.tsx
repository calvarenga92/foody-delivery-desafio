import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { requisitar } from '../api/client';
import type { Credenciais, TokenResponse } from '../api/tipos';
import { AuthContext, type Autenticacao } from './contexto';

const CHAVE_SESSAO = 'rastreador.token';

function lerTokenSalvo(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(lerTokenSalvo);

  const guardar = useCallback((novoToken: string) => {
    setToken(novoToken);
    try {
      sessionStorage.setItem(CHAVE_SESSAO, novoToken);
    } catch {
      // navegacao privada ou storage bloqueado: a sessao vive so em memoria
    }
  }, []);

  const entrar = useCallback(
    async (credenciais: Credenciais) => {
      const resposta = await requisitar<TokenResponse>('/api/auth/login', {
        metodo: 'POST',
        corpo: credenciais,
      });
      guardar(resposta.token);
    },
    [guardar],
  );

  const cadastrar = useCallback(
    async (nome: string, credenciais: Credenciais) => {
      const resposta = await requisitar<TokenResponse>('/api/auth/cadastro', {
        metodo: 'POST',
        corpo: { nome, ...credenciais },
      });
      guardar(resposta.token);
    },
    [guardar],
  );

  const sair = useCallback(() => {
    setToken(null);
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {
      // nada a fazer
    }
  }, []);

  const valor = useMemo<Autenticacao>(
    () => ({ token, autenticado: token !== null, entrar, cadastrar, sair }),
    [token, entrar, cadastrar, sair],
  );

  return <AuthContext value={valor}>{children}</AuthContext>;
}
