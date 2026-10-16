import { useState } from 'react';
import type { Pedido, StatusPedido } from '../api/tipos';
import { ACAO_STATUS, ROTULO_STATUS, formatarDataHora, formatarMoeda } from './rotulos';

interface Props {
  pedido: Pedido;
  aoAlterarStatus: (id: number, status: StatusPedido) => Promise<void>;
}

export function CardPedido({ pedido, aoAlterarStatus }: Props) {
  const [emAndamento, setEmAndamento] = useState<StatusPedido | null>(null);

  async function alterar(status: StatusPedido) {
    setEmAndamento(status);
    try {
      await aoAlterarStatus(pedido.id, status);
    } finally {
      setEmAndamento(null);
    }
  }

  return (
    <article className="cartao pedido" aria-labelledby={`pedido-${pedido.id}`}>
      <header className="pedido__topo">
        <div>
          <h3 id={`pedido-${pedido.id}`}>{pedido.cliente}</h3>
          <p className="apoio">{pedido.enderecoEntrega}</p>
        </div>
        <span className={`etiqueta etiqueta--${pedido.status.toLowerCase()}`}>
          {ROTULO_STATUS[pedido.status]}
        </span>
      </header>

      <ul className="pedido__itens">
        {pedido.itens.map((item) => (
          <li key={item.id}>
            <span>
              {item.quantidade}× {item.descricao}
            </span>
            <span>{formatarMoeda(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <footer className="pedido__rodape">
        <div>
          <strong>{formatarMoeda(pedido.valorTotal)}</strong>
          <p className="apoio">Pedido #{pedido.id} · {formatarDataHora(pedido.criadoEm)}</p>
        </div>

        {pedido.transicoesDisponiveis.length > 0 && (
          <div className="pedido__acoes">
            {pedido.transicoesDisponiveis.map((status) => (
              <button
                key={status}
                type="button"
                className={status === 'CANCELADO' ? 'secundario' : ''}
                disabled={emAndamento !== null}
                onClick={() => void alterar(status)}
              >
                {emAndamento === status ? 'Atualizando…' : ACAO_STATUS[status]}
              </button>
            ))}
          </div>
        )}
      </footer>
    </article>
  );
}
