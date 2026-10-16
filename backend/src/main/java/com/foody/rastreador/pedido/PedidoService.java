package com.foody.rastreador.pedido;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public PedidoResponse criar(CriarPedidoRequest request) {
        Pedido pedido = new Pedido(request.cliente(), request.enderecoEntrega());

        request.itens().forEach(item -> pedido.adicionarItem(
                new ItemPedido(item.descricao(), item.quantidade(), item.precoUnitario())));

        return PedidoResponse.de(pedidoRepository.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar() {
        return pedidoRepository.buscarTodosComItens().stream()
                .map(PedidoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(Long id) {
        return pedidoRepository.buscarPorIdComItens(id)
                .map(PedidoResponse::de)
                .orElseThrow(() -> new PedidoNaoEncontradoException(id));
    }

    @Transactional
    public PedidoResponse atualizarStatus(Long id, StatusPedido novoStatus) {
        Pedido pedido = pedidoRepository.buscarPorIdComItens(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException(id));

        pedido.alterarStatus(novoStatus);

        return PedidoResponse.de(pedidoRepository.save(pedido));
    }
}
