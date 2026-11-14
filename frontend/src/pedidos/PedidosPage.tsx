import { useCallback, useMemo, useState } from 'react';
import { ErroApi } from '../api/client';
import { mensagemDoErro } from '../api/mensagens';
import type { StatusPedido } from '../api/tipos';
import { useAuth } from '../auth/contexto';
import { AlternarTema } from '../componentes/AlternarTema';
import { Estado } from '../componentes/Estado';
import { Icone } from '../componentes/Icone';
import { Marca } from '../componentes/Marca';
import { Modal } from '../componentes/Modal';
import { Toast } from '../componentes/Toast';
import { CardPedido } from './CardPedido';
import { NovoPedidoForm } from './NovoPedidoForm';
import { COLUNAS, STATUS_FINAIS, type IdColuna } from './rotulos';
import { useAgora } from './useAgora';
import { usePedidos } from './usePedidos';

export function PedidosPage() {
  const { sair } = useAuth();
  const { pedidos, situacao, erro, carregar, criar, alterarStatus } = usePedidos();
  const agora = useAgora();

  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  // No celular o quadro vira uma fila filtrada por status; no desktop todas as colunas aparecem.
  const [colunaAtiva, setColunaAtiva] = useState<IdColuna>('RECEBIDO');

  const fecharToast = useCallback(() => setErroAcao(null), []);

  async function tentarAlterarStatus(id: number, status: StatusPedido) {
    setErroAcao(null);
    try {
      await alterarStatus(id, status);
    } catch (causa) {
      setErroAcao(mensagemDoErro(causa));
    }
  }

  const porColuna = useMemo(
    () =>
      COLUNAS.map((coluna) => ({
        ...coluna,
        pedidos: pedidos
          .filter((p) => coluna.status.includes(p.status))
          // Em andamento: o mais antigo primeiro (é o mais urgente). Finalizados: o mais recente.
          .sort((a, b) => {
            const diferenca = Date.parse(a.atualizadoEm) - Date.parse(b.atualizadoEm);
            return coluna.id === 'FINALIZADOS' ? -diferenca : diferenca;
          }),
      })),
    [pedidos],
  );

  const emAndamento = pedidos.filter((p) => !STATUS_FINAIS.includes(p.status)).length;
  const finalizados = pedidos.length - emAndamento;

  const sessaoExpirada = erro instanceof ErroApi && erro.status === 401;
  const semConexao = erro instanceof ErroApi && erro.codigo === 'SEM_CONEXAO';

  return (
    <div className="app-pedidos">
      <header className="topo">
        <Marca />
        <div className="topo__acoes">
          <AlternarTema />
          <button type="button" className="botao" onClick={() => setNovoAberto(true)}>
            <Icone nome="mais" />
            <span className="some-no-celular">Novo pedido</span>
          </button>
          <button type="button" className="botao botao--secundario" onClick={sair} aria-label="Sair">
            <Icone nome="sair" />
            <span className="some-no-celular">Sair</span>
          </button>
        </div>
      </header>

      <main className="quadro-pagina">
        <div className="quadro-titulo">
          <div>
            <h1>Quadro de pedidos</h1>
            <p className="apoio">Cada card mostra só as ações que o pedido permite agora.</p>
          </div>
          {situacao === 'pronto' && pedidos.length > 0 && (
            <dl className="resumo">
              <div>
                <dt>em andamento</dt>
                <dd>{emAndamento}</dd>
              </div>
              <div>
                <dt>finalizados</dt>
                <dd>{finalizados}</dd>
              </div>
            </dl>
          )}
        </div>

        {situacao === 'carregando' && (
          <div className="quadro" aria-busy="true" aria-label="Carregando pedidos">
            {COLUNAS.map((coluna) => (
              <section
                key={coluna.id}
                className={`coluna${colunaAtiva === coluna.id ? ' coluna--ativa' : ''}`}
              >
                <div className="coluna__cabecalho">
                  <h2>
                    <span className={`ponto ponto--${coluna.id.toLowerCase()}`} />
                    {coluna.titulo}
                  </h2>
                </div>
                <div className="esqueleto" />
                <div className="esqueleto esqueleto--curto" />
              </section>
            ))}
          </div>
        )}

        {situacao === 'erro' && !sessaoExpirada && (
          <Estado
            tom="erro"
            icone={semConexao ? 'semConexao' : 'alerta'}
            titulo="Não foi possível carregar"
            descricao={mensagemDoErro(erro)}
            acao={
              <button type="button" className="botao" onClick={() => void carregar()}>
                Tentar de novo
              </button>
            }
          />
        )}

        {situacao === 'pronto' && pedidos.length === 0 && (
          <Estado
            icone="caixa"
            titulo="Nenhum pedido ainda"
            descricao="Crie o primeiro pedido para ele aparecer em Recebido."
            acao={
              <button type="button" className="botao" onClick={() => setNovoAberto(true)}>
                <Icone nome="mais" />
                Novo pedido
              </button>
            }
          />
        )}

        {situacao === 'pronto' && pedidos.length > 0 && (
          <>
            <div className="chips" role="group" aria-label="Filtrar por status">
              {porColuna.map((coluna) => (
                <button
                  key={coluna.id}
                  type="button"
                  aria-pressed={colunaAtiva === coluna.id}
                  className={`chip${colunaAtiva === coluna.id ? ' chip--ativo' : ''}`}
                  onClick={() => setColunaAtiva(coluna.id)}
                >
                  {coluna.titulo}
                  <span className="chip__contagem">{coluna.pedidos.length}</span>
                </button>
              ))}
            </div>

            <div className="quadro">
              {porColuna.map((coluna) => (
                <section
                  key={coluna.id}
                  className={`coluna${colunaAtiva === coluna.id ? ' coluna--ativa' : ''}`}
                  aria-labelledby={`coluna-${coluna.id}`}
                >
                  <div className="coluna__cabecalho">
                    <h2 id={`coluna-${coluna.id}`}>
                      <span className={`ponto ponto--${coluna.id.toLowerCase()}`} />
                      {coluna.titulo}
                    </h2>
                    <span className="contagem">{coluna.pedidos.length}</span>
                  </div>

                  {coluna.pedidos.length === 0 ? (
                    <p className="coluna__vazia">Nenhum pedido aqui.</p>
                  ) : (
                    coluna.pedidos.map((pedido) => (
                      <CardPedido
                        key={pedido.id}
                        pedido={pedido}
                        agora={agora}
                        aoAlterarStatus={tentarAlterarStatus}
                      />
                    ))
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </main>

      <Modal
        aberto={novoAberto}
        aoFechar={() => setNovoAberto(false)}
        rotulo="Novo pedido"
        className="modal--painel"
      >
        <NovoPedidoForm aoCriar={criar} aoFechar={() => setNovoAberto(false)} />
      </Modal>

      <Modal aberto={sessaoExpirada} rotulo="Sessão expirada" className="modal--alerta">
        <div className="alerta-sessao">
          <span className="estado__icone estado__icone--erro">
            <Icone nome="cadeado" tamanho={22} />
          </span>
          <h2>Sua sessão expirou</h2>
          <p>Entre novamente para continuar.</p>
          <button type="button" className="botao botao--bloco" onClick={sair} data-foco-inicial>
            Voltar ao login
          </button>
        </div>
      </Modal>

      {erroAcao && (
        <Toast titulo="Não foi possível atualizar" descricao={erroAcao} aoFechar={fecharToast} />
      )}
    </div>
  );
}
