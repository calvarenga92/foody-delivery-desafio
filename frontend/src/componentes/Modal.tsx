import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  aberto: boolean;
  aoFechar?: () => void;
  rotulo: string;
  className?: string;
  children: ReactNode;
}

/** Usa <dialog> nativo: foco preso, Esc e leitores de tela vêm de graça. */
export function Modal({ aberto, aoFechar, rotulo, className, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) {
      dialogo.showModal();
      // showModal foca o primeiro elemento focável (o "fechar"); o conteúdo pode indicar outro.
      dialogo.querySelector<HTMLElement>('[data-foco-inicial]')?.focus();
    }
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className={className ? `modal ${className}` : 'modal'}
      aria-label={rotulo}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar?.();
      }}
    >
      {aberto && children}
    </dialog>
  );
}
