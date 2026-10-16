package com.foody.rastreador.pedido;

import java.math.BigDecimal;

public record ItemPedidoResponse(
        Long id,
        String descricao,
        int quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal) {

    static ItemPedidoResponse de(ItemPedido item) {
        return new ItemPedidoResponse(
                item.getId(),
                item.getDescricao(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getSubtotal());
    }
}
