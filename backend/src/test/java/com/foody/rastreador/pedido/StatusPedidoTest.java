package com.foody.rastreador.pedido;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StatusPedidoTest {

    @Test
    @DisplayName("pedido recebido so avanca para preparo ou cancelamento")
    void transicoesAPartirDeRecebido() {
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.EM_PREPARO)).isTrue();
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.CANCELADO)).isTrue();
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.SAIU_PARA_ENTREGA)).isFalse();
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.ENTREGUE)).isFalse();
    }

    @Test
    @DisplayName("fluxo completo e permitido passo a passo")
    void fluxoCompleto() {
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.EM_PREPARO)).isTrue();
        assertThat(StatusPedido.EM_PREPARO.podeTransicionarPara(StatusPedido.SAIU_PARA_ENTREGA)).isTrue();
        assertThat(StatusPedido.SAIU_PARA_ENTREGA.podeTransicionarPara(StatusPedido.ENTREGUE)).isTrue();
    }

    @Test
    @DisplayName("cancelamento e possivel enquanto o pedido nao chegou ao fim")
    void cancelamentoAntesDoFim() {
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(StatusPedido.CANCELADO)).isTrue();
        assertThat(StatusPedido.EM_PREPARO.podeTransicionarPara(StatusPedido.CANCELADO)).isTrue();
        assertThat(StatusPedido.SAIU_PARA_ENTREGA.podeTransicionarPara(StatusPedido.CANCELADO)).isTrue();
    }

    @Test
    @DisplayName("entregue e cancelado sao estados finais")
    void estadosFinais() {
        assertThat(StatusPedido.ENTREGUE.ehFinal()).isTrue();
        assertThat(StatusPedido.CANCELADO.ehFinal()).isTrue();
        assertThat(StatusPedido.ENTREGUE.transicoesDisponiveis()).isEmpty();
        assertThat(StatusPedido.CANCELADO.transicoesDisponiveis()).isEmpty();
    }

    @Test
    @DisplayName("destino nulo nunca e aceito")
    void destinoNulo() {
        assertThat(StatusPedido.RECEBIDO.podeTransicionarPara(null)).isFalse();
    }
}
