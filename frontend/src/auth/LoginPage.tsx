import { useState, type FormEvent } from 'react';
import { mensagemDoErro } from '../api/mensagens';
import { useAuth } from './contexto';

type Modo = 'entrar' | 'cadastrar';

export function LoginPage() {
  const { entrar, cadastrar } = useAuth();

  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      if (modo === 'entrar') {
        await entrar({ email, senha });
      } else {
        await cadastrar(nome, { email, senha });
      }
    } catch (causa) {
      setErro(mensagemDoErro(causa));
    } finally {
      setEnviando(false);
    }
  }

  function alternarModo() {
    setModo((atual) => (atual === 'entrar' ? 'cadastrar' : 'entrar'));
    setErro(null);
  }

  return (
    <main className="tela-centrada">
      <form className="cartao formulario" onSubmit={enviar} noValidate>
        <h1>Rastreador de Pedidos</h1>
        <p className="apoio">
          {modo === 'entrar' ? 'Entre para acompanhar os pedidos.' : 'Crie sua conta para começar.'}
        </p>

        {modo === 'cadastrar' && (
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        )}

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            required
          />
          {modo === 'cadastrar' && <small className="apoio">Mínimo de 8 caracteres.</small>}
        </div>

        <p className="erro" role="alert" aria-live="assertive">
          {erro}
        </p>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>

        <button type="button" className="link" onClick={alternarModo}>
          {modo === 'entrar' ? 'Não tenho conta' : 'Já tenho conta'}
        </button>
      </form>
    </main>
  );
}
