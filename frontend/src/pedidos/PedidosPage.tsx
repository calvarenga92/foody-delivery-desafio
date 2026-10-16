import { useState } from 'react';
import { ErroApi } from '../api/client';
import { mensagemDoErro } from '../api/mensagens';
import { useAuth } from '../auth/contexto';
import { Aviso } from '../componentes/Aviso';
import { CardPedido } from './CardPedido';
import { NovoPedidoForm } from './NovoPedidoForm';
import { usePedidos } from './usePedidos';

export function PedidosPage() {
  const { sair } = useAuth();
  const { pedidos, situacao, erro, carregar, criar, alterarStatus } = usePedidos();
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function tentarAlterarStatus(id: number, status: Parameters<typeof alterarStatus>[1]) {
    setErroAcao(null);
    try {
      await alterarStatus(id, status);
    } catch (causa) {
      setErroAcao(mensagemDoErro(causa));
    }
  }

  const sessaoExpirada = erro instanceof ErroApi && erro.status === 401;

  return (
    <div className="pagina">
      <header className="cabecalho">
        <h1>Rastreador de Pedidos</h1>
        <button type="button" className="secundario" onClick={sair}>
          Sair
        </button>
      </header>

      <div className="colunas">
        <section aria-labelledby="titulo-lista">
          <h2 id="titulo-lista">Pedidos</h2>

          {erroAcao && <Aviso tom="erro" titulo="Não foi possível atualizar" descricao={erroAcao} />}

          {situacao === 'carregando' && <Aviso titulo="Carregando pedidos…" />}

          {situacao === 'erro' && sessaoExpirada && (
            <Aviso
              tom="erro"
              titulo="Sua sessão expirou"
              descricao="Entre novamente para continuar."
              acao={
                <button type="button" onClick={sair}>
                  Voltar ao login
                </button>
              }
            />
          )}

          {situacao === 'erro' && !sessaoExpirada && (
            <Aviso
              tom="erro"
              titulo="Não foi possível carregar"
              descricao={mensagemDoErro(erro)}
              acao={
                <button type="button" onClick={() => void carregar()}>
                  Tentar de novo
                </button>
              }
            />
          )}

          {situacao === 'pronto' && pedidos.length === 0 && (
            <Aviso
              titulo="Nenhum pedido ainda"
              descricao="Crie o primeiro pedido no formulário ao lado."
            />
          )}

          {situacao === 'pronto' && pedidos.length > 0 && (
            <div className="lista">
              {pedidos.map((pedido) => (
                <CardPedido
                  key={pedido.id}
                  pedido={pedido}
                  aoAlterarStatus={tentarAlterarStatus}
                />
              ))}
            </div>
          )}
        </section>

        <aside>
          <NovoPedidoForm aoCriar={criar} />
        </aside>
      </div>
    </div>
  );
}
