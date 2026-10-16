import { ErroApi } from './client';

const POR_CODIGO: Record<string, string> = {
  SEM_CONEXAO: 'Não foi possível falar com o servidor. Confira se a API está no ar.',
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  EMAIL_JA_CADASTRADO: 'Já existe uma conta com esse e-mail.',
  DADOS_INVALIDOS: 'Confira os campos informados.',
  TRANSICAO_INVALIDA: 'Esse pedido não pode ir para esse status.',
  PEDIDO_NAO_ENCONTRADO: 'Pedido não encontrado.',
  NAO_AUTENTICADO: 'Sua sessão expirou. Entre novamente.',
};

export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (erro.detalhes.length > 0) return erro.detalhes.join(' ');
    return POR_CODIGO[erro.codigo] ?? erro.message;
  }
  return 'Ocorreu um erro inesperado.';
}
