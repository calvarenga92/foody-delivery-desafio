import { useId, useState, type FormEvent } from 'react';
import { mensagemDoErro } from '../api/mensagens';
import type { NovoItem, NovoPedido } from '../api/tipos';
import { Icone } from '../componentes/Icone';
import { formatarMoeda } from './rotulos';

interface Props {
  aoCriar: (pedido: NovoPedido) => Promise<void>;
  aoFechar: () => void;
}

type Passo = 0 | 1 | 2;

const PASSOS = ['Cliente e entrega', 'Itens', 'Revisão'] as const;

/** Rascunho do item: quantidade e preço ficam como texto enquanto o usuário digita. */
interface ItemRascunho {
  descricao: string;
  quantidade: string;
  precoUnitario: string;
}

const ITEM_VAZIO: ItemRascunho = { descricao: '', quantidade: '1', precoUnitario: '' };

type ErrosItem = Partial<Record<keyof ItemRascunho, string>>;

/** Aceita "12,50" e "12.50". Texto inválido vira NaN e cai na validação. */
const paraNumero = (texto: string) => (texto.trim() === '' ? NaN : Number(texto.replace(',', '.')));

const paraNovoItem = (item: ItemRascunho): NovoItem => ({
  descricao: item.descricao.trim(),
  quantidade: paraNumero(item.quantidade),
  precoUnitario: paraNumero(item.precoUnitario),
});

// Validação local é só conveniência para não mandar o óbvio; a regra que vale é a da API,
// que responde DADOS_INVALIDOS com os detalhes exibidos no passo de revisão.
function validarEntrega(cliente: string, endereco: string) {
  return {
    cliente: cliente.trim() ? undefined : 'Cliente é obrigatório',
    endereco: endereco.trim() ? undefined : 'Endereço de entrega é obrigatório',
  };
}

function validarItem(rascunho: ItemRascunho): ErrosItem {
  const item = paraNovoItem(rascunho);
  return {
    descricao: item.descricao ? undefined : 'Descrição do item é obrigatória',
    quantidade:
      Number.isInteger(item.quantidade) && item.quantidade > 0
        ? undefined
        : 'Quantidade deve ser maior que zero',
    precoUnitario: item.precoUnitario > 0 ? undefined : 'Preço unitário deve ser maior que zero',
  };
}

const temErro = (erros: object) => Object.values(erros).some(Boolean);

function ErroCampo({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <span className="erro-campo" id={id}>
      <Icone nome="alerta" tamanho={14} />
      {texto}
    </span>
  );
}

export function NovoPedidoForm({ aoCriar, aoFechar }: Props) {
  const idBase = useId();

  const [passo, setPasso] = useState<Passo>(0);
  const [cliente, setCliente] = useState('');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [itens, setItens] = useState<ItemRascunho[]>([{ ...ITEM_VAZIO }]);
  const [mostrarErros, setMostrarErros] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const errosEntrega = validarEntrega(cliente, enderecoEntrega);
  const errosItens = itens.map(validarItem);
  const itensConvertidos = itens.map(paraNovoItem);
  const total = itensConvertidos.reduce(
    (soma, item) => soma + (item.quantidade * item.precoUnitario || 0),
    0,
  );

  function atualizarItem(indice: number, parcial: Partial<ItemRascunho>) {
    setItens((atuais) => atuais.map((item, i) => (i === indice ? { ...item, ...parcial } : item)));
  }

  function avancar() {
    const invalido = passo === 0 ? temErro(errosEntrega) : errosItens.some(temErro);
    if (invalido) {
      setMostrarErros(true);
      return;
    }
    setMostrarErros(false);
    setErroApi(null);
    setPasso((atual) => (atual + 1) as Passo);
  }

  function voltar() {
    setMostrarErros(false);
    setPasso((atual) => (atual - 1) as Passo);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (passo < 2) {
      avancar();
      return;
    }

    setErroApi(null);
    setEnviando(true);
    try {
      await aoCriar({ cliente: cliente.trim(), enderecoEntrega: enderecoEntrega.trim(), itens: itensConvertidos });
      aoFechar();
    } catch (causa) {
      setErroApi(mensagemDoErro(causa));
    } finally {
      setEnviando(false);
    }
  }

  const erro = (texto?: string) => (mostrarErros ? texto : undefined);

  return (
    <form className="assistente" onSubmit={enviar} noValidate>
      <header className="assistente__topo">
        <h2>Novo pedido</h2>
        <button type="button" className="botao-icone" onClick={aoFechar} aria-label="Fechar">
          <Icone nome="fechar" tamanho={18} />
        </button>
      </header>

      <ol className="passos" aria-label="Etapas">
        {PASSOS.map((rotulo, indice) => {
          const estado = indice < passo ? 'feito' : indice === passo ? 'atual' : 'futuro';
          return (
            <li
              key={rotulo}
              className={`passo passo--${estado}`}
              aria-current={estado === 'atual' ? 'step' : undefined}
            >
              <span className="passo__numero">
                {estado === 'feito' ? <Icone nome="check" tamanho={14} /> : indice + 1}
              </span>
              <span className="passo__rotulo">{rotulo}</span>
            </li>
          );
        })}
      </ol>

      <div className="assistente__corpo">
        {passo === 0 && (
          <>
            <div className="campo">
              <label htmlFor={`${idBase}-cliente`}>Cliente</label>
              <input
                id={`${idBase}-cliente`}
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome de quem vai receber"
                aria-invalid={Boolean(erro(errosEntrega.cliente))}
                aria-describedby={`${idBase}-cliente-erro`}
                data-foco-inicial
                required
              />
              <ErroCampo id={`${idBase}-cliente-erro`} texto={erro(errosEntrega.cliente)} />
            </div>

            <div className="campo">
              <label htmlFor={`${idBase}-endereco`}>Endereço de entrega</label>
              <input
                id={`${idBase}-endereco`}
                value={enderecoEntrega}
                onChange={(e) => setEnderecoEntrega(e.target.value)}
                placeholder="Rua, número, complemento — bairro"
                aria-invalid={Boolean(erro(errosEntrega.endereco))}
                aria-describedby={`${idBase}-endereco-erro`}
                required
              />
              <ErroCampo id={`${idBase}-endereco-erro`} texto={erro(errosEntrega.endereco)} />
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            {itens.map((item, indice) => {
              const errosItem = errosItens[indice];
              const id = `${idBase}-item-${indice}`;
              return (
                <fieldset className="item" key={indice}>
                  <legend>Item {indice + 1}</legend>

                  <div className="campo">
                    <label htmlFor={`${id}-desc`}>Descrição</label>
                    <input
                      id={`${id}-desc`}
                      value={item.descricao}
                      onChange={(e) => atualizarItem(indice, { descricao: e.target.value })}
                      placeholder="Ex.: Pizza margherita"
                      aria-invalid={Boolean(erro(errosItem.descricao))}
                      aria-describedby={`${id}-desc-erro`}
                      autoFocus={indice === itens.length - 1}
                      required
                    />
                    <ErroCampo id={`${id}-desc-erro`} texto={erro(errosItem.descricao)} />
                  </div>

                  <div className="item__linha">
                    <div className="campo">
                      <label htmlFor={`${id}-qtd`}>Qtd.</label>
                      <input
                        id={`${id}-qtd`}
                        inputMode="numeric"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(indice, { quantidade: e.target.value })}
                        aria-invalid={Boolean(erro(errosItem.quantidade))}
                        aria-describedby={`${id}-qtd-erro`}
                        required
                      />
                      <ErroCampo id={`${id}-qtd-erro`} texto={erro(errosItem.quantidade)} />
                    </div>

                    <div className="campo">
                      <label htmlFor={`${id}-preco`}>Preço unitário (R$)</label>
                      <input
                        id={`${id}-preco`}
                        inputMode="decimal"
                        placeholder="0,00"
                        value={item.precoUnitario}
                        onChange={(e) => atualizarItem(indice, { precoUnitario: e.target.value })}
                        aria-invalid={Boolean(erro(errosItem.precoUnitario))}
                        aria-describedby={`${id}-preco-erro`}
                        required
                      />
                      <ErroCampo id={`${id}-preco-erro`} texto={erro(errosItem.precoUnitario)} />
                    </div>
                  </div>

                  {itens.length > 1 && (
                    <button
                      type="button"
                      className="botao-texto botao-texto--perigo"
                      onClick={() => setItens((atuais) => atuais.filter((_, i) => i !== indice))}
                    >
                      <Icone nome="lixeira" tamanho={14} />
                      Remover item
                    </button>
                  )}
                </fieldset>
              );
            })}

            <button
              type="button"
              className="botao botao--fantasma"
              onClick={() => setItens((atuais) => [...atuais, { ...ITEM_VAZIO }])}
            >
              <Icone nome="mais" />
              Adicionar item
            </button>

            <p className="assistente__subtotal" aria-live="polite">
              <span>Subtotal</span>
              <strong>{formatarMoeda(total)}</strong>
            </p>
          </>
        )}

        {passo === 2 && (
          <>
            {erroApi && (
              <div className="banner-erro" role="alert">
                <Icone nome="alerta" tamanho={18} />
                <div>
                  <strong>Não foi possível criar o pedido</strong>
                  <p>{erroApi}</p>
                </div>
              </div>
            )}

            <dl className="revisao">
              <div>
                <dt>Cliente</dt>
                <dd>{cliente}</dd>
              </div>
              <div>
                <dt>Endereço de entrega</dt>
                <dd>{enderecoEntrega}</dd>
              </div>
            </dl>

            <ul className="revisao__itens">
              {itensConvertidos.map((item, indice) => (
                <li key={indice}>
                  <span>
                    {item.quantidade}× {item.descricao}
                  </span>
                  <span>{formatarMoeda(item.quantidade * item.precoUnitario)}</span>
                </li>
              ))}
              <li className="revisao__total">
                <span>Total</span>
                <span>{formatarMoeda(total)}</span>
              </li>
            </ul>

            <p className="apoio">O pedido entra em Recebido.</p>
          </>
        )}
      </div>

      <footer className="assistente__rodape">
        {passo > 0 ? (
          <button type="button" className="botao botao--secundario" onClick={voltar} disabled={enviando}>
            Voltar
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="botao" disabled={enviando}>
          {passo < 2 ? 'Continuar' : enviando ? 'Criando…' : 'Criar pedido'}
        </button>
      </footer>
    </form>
  );
}
