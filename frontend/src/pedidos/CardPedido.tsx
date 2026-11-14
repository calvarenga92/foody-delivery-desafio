import { useState } from 'react';
import type { Pedido, StatusPedido } from '../api/tipos';
import { Icone } from '../componentes/Icone';
import {
  ACAO_STATUS,
  MINUTOS_ALERTA,
  ROTULO_STATUS,
  STATUS_FINAIS,
  contarItens,
  formatarDataHora,
  formatarMoeda,
  formatarTempoRelativo,
  minutosDesde,
} from './rotulos';

interface Props {
  pedido: Pedido;
  agora: number;
  aoAlterarStatus: (id: number, status: StatusPedido) => Promise<void>;
}

export function CardPedido({ pedido, agora, aoAlterarStatus }: Props) {
  const [emAndamento, setEmAndamento] = useState<StatusPedido | null>(null);

  async function alterar(status: StatusPedido) {
    setEmAndamento(status);
    try {
      await aoAlterarStatus(pedido.id, status);
    } finally {
      setEmAndamento(null);
    }
  }

  const finalizado = STATUS_FINAIS.includes(pedido.status);
  const minutos = minutosDesde(pedido.atualizadoEm, agora);
  const atrasado = !finalizado && minutos >= MINUTOS_ALERTA;
  const quantidadeItens = pedido.itens.reduce((soma, item) => soma + item.quantidade, 0);

  // A próxima etapa é a ação principal; cancelar fica como secundária.
  const avancos = pedido.transicoesDisponiveis.filter((s) => s !== 'CANCELADO');
  const podeCancelar = pedido.transicoesDisponiveis.includes('CANCELADO');

  return (
    <article
      className={`cartao card-pedido${finalizado ? ' card-pedido--final' : ''}`}
      aria-labelledby={`pedido-${pedido.id}`}
    >
      <div className="card-pedido__linha">
        <span className="card-pedido__id">#{pedido.id}</span>
        {finalizado ? (
          <span className={`etiqueta etiqueta--${pedido.status.toLowerCase()}`}>
            {ROTULO_STATUS[pedido.status]}
          </span>
        ) : (
          <span
            className={`card-pedido__tempo${atrasado ? ' card-pedido__tempo--alerta' : ''}`}
            title={`Neste status desde ${formatarDataHora(pedido.atualizadoEm)}`}
          >
            <Icone nome="relogio" tamanho={13} />
            {formatarTempoRelativo(minutos)}
          </span>
        )}
      </div>

      <h3 id={`pedido-${pedido.id}`} className="card-pedido__cliente">
        {pedido.cliente}
      </h3>

      <p className="card-pedido__endereco" title={pedido.enderecoEntrega}>
        <Icone nome="local" tamanho={14} />
        <span>{pedido.enderecoEntrega}</span>
      </p>

      <details className="card-pedido__itens">
        <summary>
          <span>{contarItens(quantidadeItens)}</span>
          <Icone nome="seta" tamanho={14} className="card-pedido__seta" />
          <strong className="card-pedido__total">{formatarMoeda(pedido.valorTotal)}</strong>
        </summary>
        <ul>
          {pedido.itens.map((item) => (
            <li key={item.id}>
              <span>
                {item.quantidade}× {item.descricao}
              </span>
              <span>{formatarMoeda(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      </details>

      {finalizado && (
        <p className="card-pedido__rodape-final">
          atualizado {formatarTempoRelativo(minutos)}
        </p>
      )}

      {(avancos.length > 0 || podeCancelar) && (
        <div className="card-pedido__acoes">
          {avancos.map((status) => (
            <button
              key={status}
              type="button"
              className="botao botao--bloco"
              disabled={emAndamento !== null}
              onClick={() => void alterar(status)}
            >
              {emAndamento === status ? 'Atualizando…' : ACAO_STATUS[status]}
            </button>
          ))}
          {podeCancelar && (
            <button
              type="button"
              className="botao-texto"
              disabled={emAndamento !== null}
              onClick={() => void alterar('CANCELADO')}
            >
              {emAndamento === 'CANCELADO' ? 'Cancelando…' : ACAO_STATUS.CANCELADO}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
