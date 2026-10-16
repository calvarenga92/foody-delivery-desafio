package com.foody.rastreador.pedido;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("select distinct p from Pedido p left join fetch p.itens order by p.criadoEm desc")
    List<Pedido> buscarTodosComItens();

    @Query("select p from Pedido p left join fetch p.itens where p.id = :id")
    Optional<Pedido> buscarPorIdComItens(@Param("id") Long id);
}
