import { useEffect } from 'react';
import { Icone } from './Icone';

interface Props {
  titulo: string;
  descricao: string;
  aoFechar: () => void;
}

const DURACAO_MS = 6000;

export function Toast({ titulo, descricao, aoFechar }: Props) {
  useEffect(() => {
    const temporizador = window.setTimeout(aoFechar, DURACAO_MS);
    return () => window.clearTimeout(temporizador);
  }, [titulo, descricao, aoFechar]);

  return (
    <div className="toast" role="alert">
      <Icone nome="alerta" tamanho={20} className="toast__icone" />
      <div className="toast__texto">
        <strong>{titulo}</strong>
        <p>{descricao}</p>
      </div>
      <button type="button" className="botao-icone botao-icone--escuro" onClick={aoFechar} aria-label="Fechar aviso">
        <Icone nome="fechar" />
      </button>
    </div>
  );
}
