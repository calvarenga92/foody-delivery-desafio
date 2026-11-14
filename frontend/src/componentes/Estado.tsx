import type { ReactNode } from 'react';
import { Icone, type NomeIcone } from './Icone';

interface Props {
  icone: NomeIcone;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  tom?: 'acento' | 'erro' | 'neutro';
}

/** Estado de tela inteira: vazio, erro de carregamento, sem conexão. */
export function Estado({ icone, titulo, descricao, acao, tom = 'acento' }: Props) {
  return (
    <div className="estado" role={tom === 'erro' ? 'alert' : 'status'}>
      <span className={`estado__icone estado__icone--${tom}`}>
        <Icone nome={icone} tamanho={24} />
      </span>
      <h2>{titulo}</h2>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  );
}
