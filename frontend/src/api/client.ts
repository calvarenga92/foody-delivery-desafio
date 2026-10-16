import type { CorpoErro } from './tipos';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ErroApi extends Error {
  readonly codigo: string;
  readonly status: number;
  readonly detalhes: string[];

  constructor(status: number, corpo: Partial<CorpoErro>) {
    super(corpo.mensagem ?? 'Não foi possível completar a operação');
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = corpo.codigo ?? 'ERRO_DESCONHECIDO';
    this.detalhes = corpo.detalhes ?? [];
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  corpo?: unknown;
  token?: string | null;
}

export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { metodo = 'GET', corpo, token } = opcoes;

  let resposta: Response;

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(0, {
      codigo: 'SEM_CONEXAO',
      mensagem: 'Não foi possível falar com o servidor.',
    });
  }

  const texto = await resposta.text();
  const dados = texto ? (JSON.parse(texto) as unknown) : null;

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, (dados ?? {}) as Partial<CorpoErro>);
  }

  return dados as T;
}
