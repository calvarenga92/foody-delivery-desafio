import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  tom?: 'neutro' | 'erro';
}

export function Aviso({ titulo, descricao, acao, tom = 'neutro' }: Props) {
  return (
    <div className={`aviso aviso--${tom}`} role={tom === 'erro' ? 'alert' : 'status'}>
      <strong>{titulo}</strong>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  );
}
