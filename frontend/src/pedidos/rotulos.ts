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

export type IdColuna = 'RECEBIDO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'FINALIZADOS';

export interface Coluna {
  id: IdColuna;
  titulo: string;
  status: StatusPedido[];
}

/** Colunas do quadro. Entregue e Cancelado são finais e dividem a mesma coluna. */
export const COLUNAS: Coluna[] = [
  { id: 'RECEBIDO', titulo: 'Recebido', status: ['RECEBIDO'] },
  { id: 'EM_PREPARO', titulo: 'Em preparo', status: ['EM_PREPARO'] },
  { id: 'SAIU_PARA_ENTREGA', titulo: 'Saiu para entrega', status: ['SAIU_PARA_ENTREGA'] },
  { id: 'FINALIZADOS', titulo: 'Finalizados', status: ['ENTREGUE', 'CANCELADO'] },
];

export const STATUS_FINAIS: StatusPedido[] = ['ENTREGUE', 'CANCELADO'];

/** Pedido parado no mesmo status por mais tempo que isso ganha destaque. */
export const MINUTOS_ALERTA = 10;

export const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function minutosDesde(iso: string, agora: number): number {
  return Math.max(0, Math.floor((agora - new Date(iso).getTime()) / 60_000));
}

export function formatarTempoRelativo(minutos: number): string {
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
}

export function contarItens(quantidade: number): string {
  return quantidade === 1 ? '1 item' : `${quantidade} itens`;
}
