package com.foody.rastreador.pedido;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PedidoTest {

    private Pedido pedidoComDoisItens() {
        Pedido pedido = new Pedido("Maria Silva", "Rua das Flores, 123");
        pedido.adicionarItem(new ItemPedido("Pizza Calabresa", 1, new BigDecimal("54.90")));
        pedido.adicionarItem(new ItemPedido("Coca 2L", 2, new BigDecimal("12.50")));
        return pedido;
    }

    @Test
    @DisplayName("pedido nasce com status recebido")
    void statusInicial() {
        assertThat(new Pedido("Joao", "Rua A, 1").getStatus()).isEqualTo(StatusPedido.RECEBIDO);
    }

    @Test
    @DisplayName("valor total soma os subtotais sem perder centavos")
    void valorTotal() {
        assertThat(pedidoComDoisItens().getValorTotal()).isEqualByComparingTo(new BigDecimal("79.90"));
    }

    @Test
    @DisplayName("transicao valida muda o status")
    void transicaoValida() {
        Pedido pedido = pedidoComDoisItens();
        pedido.alterarStatus(StatusPedido.EM_PREPARO);
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.EM_PREPARO);
    }

    @Test
    @DisplayName("transicao invalida e recusada pela propria entidade")
    void transicaoInvalida() {
        Pedido pedido = pedidoComDoisItens();

        assertThatThrownBy(() -> pedido.alterarStatus(StatusPedido.ENTREGUE))
                .isInstanceOf(TransicaoInvalidaException.class);

        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.RECEBIDO);
    }

    @Test
    @DisplayName("pedido entregue nao aceita mais nenhuma mudanca")
    void estadoFinalNaoMuda() {
        Pedido pedido = pedidoComDoisItens();
        pedido.alterarStatus(StatusPedido.EM_PREPARO);
        pedido.alterarStatus(StatusPedido.SAIU_PARA_ENTREGA);
        pedido.alterarStatus(StatusPedido.ENTREGUE);

        assertThatThrownBy(() -> pedido.alterarStatus(StatusPedido.CANCELADO))
                .isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    @DisplayName("lista de itens exposta e imutavel")
    void itensImutaveis() {
        Pedido pedido = pedidoComDoisItens();

        assertThatThrownBy(() -> pedido.getItens().add(new ItemPedido("Burlado", 1, BigDecimal.ONE)))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
