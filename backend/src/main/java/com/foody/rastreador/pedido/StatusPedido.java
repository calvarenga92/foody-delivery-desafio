package com.foody.rastreador.pedido;

import java.util.EnumSet;
import java.util.Set;

/** Ciclo de vida do pedido. As transições válidas ficam aqui, não no service. */
public enum StatusPedido {

    RECEBIDO,
    EM_PREPARO,
    SAIU_PARA_ENTREGA,
    ENTREGUE,
    CANCELADO;

    private Set<StatusPedido> proximosPermitidos() {
        return switch (this) {
            case RECEBIDO -> EnumSet.of(EM_PREPARO, CANCELADO);
            case EM_PREPARO -> EnumSet.of(SAIU_PARA_ENTREGA, CANCELADO);
            case SAIU_PARA_ENTREGA -> EnumSet.of(ENTREGUE, CANCELADO);
            case ENTREGUE, CANCELADO -> EnumSet.noneOf(StatusPedido.class);
        };
    }

    public boolean ehFinal() {
        return proximosPermitidos().isEmpty();
    }

    public boolean podeTransicionarPara(StatusPedido destino) {
        return destino != null && proximosPermitidos().contains(destino);
    }

    /** Usado pela API para a interface só oferecer os status realmente possíveis. */
    public Set<StatusPedido> transicoesDisponiveis() {
        return proximosPermitidos();
    }
}
