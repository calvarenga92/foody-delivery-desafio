import type { StatusPedido } from '../api/tipos';

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const ACAO_STATUS: Record<StatusPedido, string> = {
  RECEBIDO: 'Voltar para recebido',
  EM_PREPARO: 'Iniciar preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Marcar como entregue',
  CANCELADO: 'Cancelar pedido',
};

export const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
