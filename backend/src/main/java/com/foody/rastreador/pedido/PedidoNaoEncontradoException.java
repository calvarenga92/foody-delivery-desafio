package com.foody.rastreador.pedido;

public class PedidoNaoEncontradoException extends RuntimeException {

    public PedidoNaoEncontradoException(Long id) {
        super("Pedido %d não encontrado".formatted(id));
    }
}
