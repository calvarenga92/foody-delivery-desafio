package com.foody.rastreador.pedido;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PedidoControllerIT {

    private static final String PEDIDO_VALIDO = """
            {
              "cliente": "Maria Silva",
              "enderecoEntrega": "Rua das Flores, 123",
              "itens": [
                {"descricao": "Pizza Calabresa", "quantidade": 1, "precoUnitario": 54.90},
                {"descricao": "Coca 2L", "quantidade": 2, "precoUnitario": 12.50}
              ]
            }""";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String autorizacao;

    @BeforeEach
    void autenticar() throws Exception {
        String email = "pedidos+%d@teste.com".formatted(System.nanoTime());

        String resposta = mockMvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Claudio","email":"%s","senha":"senha12345"}""".formatted(email)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        autorizacao = "Bearer " + objectMapper.readTree(resposta).get("token").asText();
    }

    private long criarPedido() throws Exception {
        String resposta = mockMvc.perform(post("/api/pedidos")
                        .header(HttpHeaders.AUTHORIZATION, autorizacao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PEDIDO_VALIDO))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode corpo = objectMapper.readTree(resposta);
        return corpo.get("id").asLong();
    }

    @Test
    @DisplayName("sem token a api responde 401 em vez de 404")
    void exigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
    }

    @Test
    @DisplayName("token invalido tambem e recusado")
    void tokenInvalido() throws Exception {
        mockMvc.perform(get("/api/pedidos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token.que.nao.vale"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("pedido criado nasce recebido com total somado")
    void criarPedido() throws Exception {
        mockMvc.perform(post("/api/pedidos")
                        .header(HttpHeaders.AUTHORIZATION, autorizacao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PEDIDO_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RECEBIDO"))
                .andExpect(jsonPath("$.valorTotal").value(79.90))
                .andExpect(jsonPath("$.itens.length()").value(2))
                .andExpect(jsonPath("$.transicoesDisponiveis.length()").value(2));
    }

    @Test
    @DisplayName("pedido sem item e recusado na validacao")
    void pedidoSemItem() throws Exception {
        mockMvc.perform(post("/api/pedidos")
                        .header(HttpHeaders.AUTHORIZATION, autorizacao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cliente":"Maria","enderecoEntrega":"Rua A, 1","itens":[]}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"));
    }

    @Test
    @DisplayName("busca por id devolve o pedido criado")
    void buscarPorId() throws Exception {
        long id = criarPedido();

        mockMvc.perform(get("/api/pedidos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, autorizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.cliente").value("Maria Silva"));
    }

    @Test
    @DisplayName("id inexistente devolve 404")
    void pedidoInexistente() throws Exception {
        mockMvc.perform(get("/api/pedidos/{id}", 999999)
                        .header(HttpHeaders.AUTHORIZATION, autorizacao))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("PEDIDO_NAO_ENCONTRADO"));
    }

    @Test
    @DisplayName("listagem traz os pedidos com seus itens")
    void listar() throws Exception {
        criarPedido();

        mockMvc.perform(get("/api/pedidos")
                        .header(HttpHeaders.AUTHORIZATION, autorizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itens").isNotEmpty());
    }

    @Test
    @DisplayName("salto de status e recusado com 409")
    void transicaoInvalida() throws Exception {
        long id = criarPedido();

        mockMvc.perform(patch("/api/pedidos/{id}/status", id)
                        .header(HttpHeaders.AUTHORIZATION, autorizacao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"ENTREGUE"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICAO_INVALIDA"));
    }

    @Test
    @DisplayName("fluxo completo ate entregue zera as transicoes disponiveis")
    void fluxoCompleto() throws Exception {
        long id = criarPedido();

        atualizarStatus(id, "EM_PREPARO").andExpect(jsonPath("$.status").value("EM_PREPARO"));
        atualizarStatus(id, "SAIU_PARA_ENTREGA").andExpect(jsonPath("$.status").value("SAIU_PARA_ENTREGA"));

        atualizarStatus(id, "ENTREGUE")
                .andExpect(jsonPath("$.status").value("ENTREGUE"))
                .andExpect(jsonPath("$.transicoesDisponiveis.length()").value(0));
    }

    private org.springframework.test.web.servlet.ResultActions atualizarStatus(long id, String status)
            throws Exception {
        return mockMvc.perform(patch("/api/pedidos/{id}/status", id)
                        .header(HttpHeaders.AUTHORIZATION, autorizacao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"%s"}""".formatted(status)))
                .andExpect(status().isOk());
    }
}
