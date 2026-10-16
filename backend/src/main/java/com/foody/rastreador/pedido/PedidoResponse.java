package com.foody.rastreador.pedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public record PedidoResponse(
        Long id,
        String cliente,
        String enderecoEntrega,
        StatusPedido status,
        Set<StatusPedido> transicoesDisponiveis,
        List<ItemPedidoResponse> itens,
        BigDecimal valorTotal,
        Instant criadoEm,
        Instant atualizadoEm) {

    static PedidoResponse de(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getCliente(),
                pedido.getEnderecoEntrega(),
                pedido.getStatus(),
                pedido.getStatus().transicoesDisponiveis(),
                pedido.getItens().stream().map(ItemPedidoResponse::de).toList(),
                pedido.getValorTotal(),
                pedido.getCriadoEm(),
                pedido.getAtualizadoEm());
    }
}
