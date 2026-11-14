import { useEffect, useState } from 'react';
import { Icone } from './Icone';

type Tema = 'claro' | 'escuro';

const CHAVE_TEMA = 'rango.tema';
const consultaEscuro = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Tema efetivo: o escolhido pelo usuário ou, sem escolha, o do sistema. */
function temaInicial(): Tema {
  const definido = document.documentElement.dataset.tema;
  if (definido === 'claro' || definido === 'escuro') return definido;
  return consultaEscuro().matches ? 'escuro' : 'claro';
}

export function AlternarTema({ className }: { className?: string }) {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [escolhido, setEscolhido] = useState(() => document.documentElement.dataset.tema !== undefined);

  // Sem escolha do usuário, acompanha a troca de tema do sistema em tempo real.
  useEffect(() => {
    if (escolhido) return;
    const consulta = consultaEscuro();
    const aoMudar = (evento: MediaQueryListEvent) => setTema(evento.matches ? 'escuro' : 'claro');
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, [escolhido]);

  function alternar() {
    const proximo: Tema = tema === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = proximo;
    try {
      localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // storage bloqueado: a escolha vale só até recarregar
    }
    setTema(proximo);
    setEscolhido(true);
  }

  const rotulo = tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro';

  return (
    <button
      type="button"
      className={`botao-icone botao-icone--contorno${className ? ` ${className}` : ''}`}
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
    >
      <Icone nome={tema === 'escuro' ? 'sol' : 'lua'} tamanho={18} />
    </button>
  );
}
