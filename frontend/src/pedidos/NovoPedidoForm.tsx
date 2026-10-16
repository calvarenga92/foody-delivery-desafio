import { useId, useState, type FormEvent } from 'react';
import { mensagemDoErro } from '../api/mensagens';
import type { NovoItem, NovoPedido } from '../api/tipos';

interface Props {
  aoCriar: (pedido: NovoPedido) => Promise<void>;
}

const ITEM_VAZIO: NovoItem = { descricao: '', quantidade: 1, precoUnitario: 0 };

export function NovoPedidoForm({ aoCriar }: Props) {
  const idBase = useId();

  const [cliente, setCliente] = useState('');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [itens, setItens] = useState<NovoItem[]>([{ ...ITEM_VAZIO }]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function atualizarItem(indice: number, parcial: Partial<NovoItem>) {
    setItens((atuais) =>
      atuais.map((item, i) => (i === indice ? { ...item, ...parcial } : item)),
    );
  }

  function adicionarItem() {
    setItens((atuais) => [...atuais, { ...ITEM_VAZIO }]);
  }

  function removerItem(indice: number) {
    setItens((atuais) => atuais.filter((_, i) => i !== indice));
  }

  function limpar() {
    setCliente('');
    setEnderecoEntrega('');
    setItens([{ ...ITEM_VAZIO }]);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await aoCriar({ cliente, enderecoEntrega, itens });
      limpar();
    } catch (causa) {
      setErro(mensagemDoErro(causa));
    } finally {
      setEnviando(false);
    }
  }

  const total = itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);

  return (
    <form className="cartao formulario" onSubmit={enviar} noValidate>
      <h2>Novo pedido</h2>

      <div className="campo">
        <label htmlFor={`${idBase}-cliente`}>Cliente</label>
        <input
          id={`${idBase}-cliente`}
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor={`${idBase}-endereco`}>Endereço de entrega</label>
        <input
          id={`${idBase}-endereco`}
          value={enderecoEntrega}
          onChange={(e) => setEnderecoEntrega(e.target.value)}
          required
        />
      </div>

      <fieldset className="itens">
        <legend>Itens</legend>

        {itens.map((item, indice) => (
          <div className="item" key={indice}>
            <div className="campo campo--cresce">
              <label htmlFor={`${idBase}-desc-${indice}`}>Descrição</label>
              <input
                id={`${idBase}-desc-${indice}`}
                value={item.descricao}
                onChange={(e) => atualizarItem(indice, { descricao: e.target.value })}
                required
              />
            </div>

            <div className="campo campo--estreito">
              <label htmlFor={`${idBase}-qtd-${indice}`}>Qtd.</label>
              <input
                id={`${idBase}-qtd-${indice}`}
                type="number"
                min={1}
                value={item.quantidade}
                onChange={(e) => atualizarItem(indice, { quantidade: Number(e.target.value) })}
                required
              />
            </div>

            <div className="campo campo--estreito">
              <label htmlFor={`${idBase}-preco-${indice}`}>Preço</label>
              <input
                id={`${idBase}-preco-${indice}`}
                type="number"
                min={0}
                step={0.01}
                value={item.precoUnitario}
                onChange={(e) => atualizarItem(indice, { precoUnitario: Number(e.target.value) })}
                required
              />
            </div>

            <button
              type="button"
              className="secundario"
              onClick={() => removerItem(indice)}
              disabled={itens.length === 1}
              aria-label={`Remover item ${indice + 1}`}
            >
              Remover
            </button>
          </div>
        ))}

        <button type="button" className="link" onClick={adicionarItem}>
          Adicionar item
        </button>
      </fieldset>

      <p className="total" aria-live="polite">
        Total: <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      </p>

      <p className="erro" role="alert" aria-live="assertive">
        {erro}
      </p>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Criando…' : 'Criar pedido'}
      </button>
    </form>
  );
}
