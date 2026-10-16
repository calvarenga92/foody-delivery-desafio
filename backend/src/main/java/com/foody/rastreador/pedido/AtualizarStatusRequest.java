package com.foody.rastreador.pedido;

import jakarta.validation.constraints.NotNull;

public record AtualizarStatusRequest(
        @NotNull(message = "Status é obrigatório")
        StatusPedido status) {
}
