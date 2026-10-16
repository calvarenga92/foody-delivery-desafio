import { useCallback, useEffect, useState } from 'react';
import { requisitar } from '../api/client';
import type { NovoPedido, Pedido, StatusPedido } from '../api/tipos';
import { useAuth } from '../auth/contexto';

type Situacao = 'carregando' | 'pronto' | 'erro';

export function usePedidos() {
  const { token, sair } = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [situacao, setSituacao] = useState<Situacao>('carregando');
  const [erro, setErro] = useState<unknown>(null);

  const carregar = useCallback(async () => {
    setSituacao('carregando');
    setErro(null);

    try {
      setPedidos(await requisitar<Pedido[]>('/api/pedidos', { token }));
      setSituacao('pronto');
    } catch (causa) {
      setErro(causa);
      setSituacao('erro');
    }
  }, [token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const criar = useCallback(
    async (novo: NovoPedido) => {
      const criado = await requisitar<Pedido>('/api/pedidos', {
        metodo: 'POST',
        corpo: novo,
        token,
      });
      setPedidos((atuais) => [criado, ...atuais]);
    },
    [token],
  );

  // Atualizacao otimista: a tela muda antes da resposta e volta atras se a API recusar.
  const alterarStatus = useCallback(
    async (id: number, status: StatusPedido) => {
      const anteriores = pedidos;

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === id ? { ...pedido, status, transicoesDisponiveis: [] } : pedido,
        ),
      );

      try {
        const atualizado = await requisitar<Pedido>(`/api/pedidos/${id}/status`, {
          metodo: 'PATCH',
          corpo: { status },
          token,
        });
        setPedidos((atuais) => atuais.map((p) => (p.id === id ? atualizado : p)));
      } catch (causa) {
        setPedidos(anteriores);
        throw causa;
      }
    },
    [pedidos, token],
  );

  return { pedidos, situacao, erro, carregar, criar, alterarStatus, sair };
}
