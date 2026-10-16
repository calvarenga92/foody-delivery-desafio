export type StatusPedido =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface ItemPedido {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  cliente: string;
  enderecoEntrega: string;
  status: StatusPedido;
  transicoesDisponiveis: StatusPedido[];
  itens: ItemPedido[];
  valorTotal: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NovoItem {
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

export interface NovoPedido {
  cliente: string;
  enderecoEntrega: string;
  itens: NovoItem[];
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface TokenResponse {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
}

export interface CorpoErro {
  codigo: string;
  mensagem: string;
  momento: string;
  detalhes?: string[];
}
