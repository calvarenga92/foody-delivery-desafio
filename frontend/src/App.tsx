import { LoginPage } from './auth/LoginPage';
import { useAuth } from './auth/contexto';
import { Rodape } from './componentes/Rodape';
import { PedidosPage } from './pedidos/PedidosPage';

export function App() {
  const { autenticado } = useAuth();
  return (
    <div className="app">
      {autenticado ? <PedidosPage /> : <LoginPage />}
      <Rodape />
    </div>
  );
}
