package com.foody.rastreador.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CriarPedidoRequest(
        @NotBlank(message = "Cliente é obrigatório")
        String cliente,

        @NotBlank(message = "Endereço de entrega é obrigatório")
        String enderecoEntrega,

        @NotEmpty(message = "Pedido deve ter pelo menos um item")
        @Valid
        List<ItemPedidoRequest> itens) {
}
