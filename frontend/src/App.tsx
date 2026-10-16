import { LoginPage } from './auth/LoginPage';
import { useAuth } from './auth/contexto';
import { PedidosPage } from './pedidos/PedidosPage';

export function App() {
  const { autenticado } = useAuth();
  return autenticado ? <PedidosPage /> : <LoginPage />;
}
