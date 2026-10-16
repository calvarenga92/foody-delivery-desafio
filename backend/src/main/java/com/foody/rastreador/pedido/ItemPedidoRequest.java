package com.foody.rastreador.pedido;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ItemPedidoRequest(
        @NotBlank(message = "Descrição do item é obrigatória")
        String descricao,

        @Positive(message = "Quantidade deve ser maior que zero")
        int quantidade,

        @NotNull(message = "Preço unitário é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
        BigDecimal precoUnitario) {
}
