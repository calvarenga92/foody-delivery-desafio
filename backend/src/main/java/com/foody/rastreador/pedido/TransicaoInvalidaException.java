package com.foody.rastreador.pedido;

public class TransicaoInvalidaException extends RuntimeException {

    private final StatusPedido origem;
    private final StatusPedido destino;

    public TransicaoInvalidaException(StatusPedido origem, StatusPedido destino) {
        super("Não é possível mudar o status de %s para %s".formatted(origem, destino));
        this.origem = origem;
        this.destino = destino;
    }

    public StatusPedido getOrigem() {
        return origem;
    }

    public StatusPedido getDestino() {
        return destino;
    }
}
