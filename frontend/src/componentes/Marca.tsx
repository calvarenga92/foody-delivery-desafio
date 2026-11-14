import { Icone } from './Icone';

export function Marca() {
  return (
    <div className="marca">
      <span className="marca__logo">
        <Icone nome="marca" tamanho={20} />
      </span>
      <span className="marca__texto">
        <strong>Rango</strong>
        <small>Rastreador de Pedidos</small>
      </span>
    </div>
  );
}
