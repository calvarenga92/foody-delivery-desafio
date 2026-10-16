# Mini Rastreador de Pedidos

Desafio técnico CLAUDIO ALVARENGA — Foody Delivery 16/10

Sistema simplificado de rastreamento de pedidos de delivery, com API REST em Java + Spring Boot e interface web em React.

## Organização

Optei por monorepo com `backend/` e `frontend/` no mesmo repositório. A decisão foi pensada na avaliação: um único clone, um único histórico de commits, e a relação entre contrato de API e consumo fica visível lado a lado.

```
.
├── backend/    API REST — Java 21 + Spring Boot 3
└── frontend/   SPA — React + TypeScript + Vite
```

## Como rodar

Pré-requisitos: JDK 21, Maven 3.9+ e Node 22+.

**Backend** (sobe em `http://localhost:8080`):

```bash
cd backend
mvn spring-boot:run
```

O banco SQLite é criado automaticamente em `backend/rastreador.db` na primeira execução.

**Frontend** (sobe em `http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

**Testes:**

```bash
cd backend
mvn verify
```

## API

Todas as rotas abaixo de `/api/pedidos` exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/cadastro` | Cria usuário e devolve token |
| POST | `/api/auth/login` | Autentica e devolve token |
| POST | `/api/pedidos` | Cria pedido com itens |
| GET | `/api/pedidos` | Lista pedidos |
| GET | `/api/pedidos/{id}` | Busca pedido por id |
| PATCH | `/api/pedidos/{id}/status` | Atualiza o status do pedido |

Erros seguem um contrato único:

```json
{
  "codigo": "TRANSICAO_INVALIDA",
  "mensagem": "Não é possível mudar o status de RECEBIDO para ENTREGUE",
  "momento": "2026-10-16T20:53:52Z",
  "detalhes": ["opcional, usado em erro de validação"]
}
```

O front decide o que exibir pelo `codigo`, nunca pela mensagem. Assim o texto pode mudar no servidor sem quebrar a interface.

## Decisões técnicas

### O ciclo de vida do pedido mora no enum

As transições válidas estão declaradas em `StatusPedido`, não espalhadas pelo service:

```
RECEBIDO          → EM_PREPARO, CANCELADO
EM_PREPARO        → SAIU_PARA_ENTREGA, CANCELADO
SAIU_PARA_ENTREGA → ENTREGUE, CANCELADO
ENTREGUE          → (final)
CANCELADO         → (final)
```

Se a regra ficasse no service, qualquer rota nova de atualização precisaria lembrar de revalidar o fluxo. No enum, o estado é dono da própria regra e não existe caminho que a contorne. `Pedido.alterarStatus()` consulta essa regra e recusa o que não for permitido — a entidade tem comportamento, não só getters.

O enum também expõe `transicoesDisponiveis()`, que a API devolve em cada pedido. O front usa isso para renderizar só os botões realmente possíveis: a máquina de estados existe em um lugar só e os dois lados obedecem a ela.

### Dinheiro em BigDecimal

`double` não representa decimais exatamente — `0.1 + 0.2` dá `0.30000000000000004`. Num sistema de pedidos isso vira centavo errado. Valores monetários usam `BigDecimal` do banco até a serialização.

O valor total é calculado a partir dos itens, não armazenado em coluna. O preço unitário fica congelado no item no momento do pedido, então o total sempre bate — guardar o total criaria duas fontes de verdade capazes de divergir.

### Autenticação stateless com JWT

Sem sessão no servidor: cada requisição carrega o próprio token. Isso permite escalar horizontalmente sem sticky session nem store de sessão compartilhado.

Senhas são gravadas com BCrypt, que tem salt próprio por senha e custo ajustável — feito para ser lento, ao contrário de MD5 e SHA.

**Login responde igual para e-mail inexistente e para senha errada.** É proposital: respostas diferentes permitem enumerar quem tem conta no sistema, o que vira insumo para phishing e força bruta direcionada.

### open-in-view desligado

O Spring Boot liga `spring.jpa.open-in-view` por padrão, mantendo a sessão do banco aberta até a resposta ser serializada. Isso esconde N+1 e segura conexão à toa. Com ele desligado, lazy loading fora da transação falha em desenvolvimento em vez de virar lentidão em produção.

Por isso o `PedidoRepository` traz pedido e itens com `join fetch` explícito.

### saveAndFlush na atualização de status

O `@PreUpdate` que atualiza `atualizadoEm` só dispara no flush, que por padrão acontece no commit — depois do método do service retornar. O resultado era uma resposta com o timestamp antigo, mesmo com o dado correto no banco. Encontrei isso testando a API, não em teste unitário: só aparece quando se olha a resposta HTTP de verdade.

A correção foi `saveAndFlush` apenas nesse ponto. Não é algo para espalhar: forçar flush em todo lugar anula o batching do Hibernate.

### Front sem roteador e sem biblioteca de estado

A aplicação tem duas telas e a alternância depende só de estar autenticado ou não. React Router resolveria um problema que não existe aqui, e state manager também não: o estado é um contexto de autenticação e uma lista vinda da API.

Não adicionei biblioteca de estilo. O CSS é próprio, com variáveis e suporte a tema claro e escuro, para não trazer dependência que o desafio não pediu.

### Quatro estados em cada tela

Carregando, erro, vazio e sem permissão são tratados explicitamente, não só o caminho feliz. Lista vazia e sessão expirada são os dois que mais escapam e viram tela quebrada em produção.

### Atualização otimista com rollback

Mudar o status atualiza a interface antes da resposta chegar. Se a API recusar, o estado anterior é restaurado e o erro aparece. A percepção de velocidade melhora sem mentir sobre o resultado.

### Token em sessionStorage

Escolhi `sessionStorage` em vez de `localStorage`: a sessão morre quando a aba fecha, o que reduz a janela de exposição. Todas as leituras e escritas estão em `try/catch` — em navegação privada o acesso pode lançar, e nesse caso a sessão simplesmente vive em memória.

### Testes separados por tipo

Testes unitários (`*Test`) rodam no Surefire com `mvn test`: são rápidos e não sobem contexto. Testes de integração (`*IT`) rodam no Failsafe com `mvn verify`: sobem a aplicação inteira e batem na API real, passando pelo filtro JWT.

A separação permite rodar o ciclo rápido durante o desenvolvimento e o completo antes de entregar. São 24 testes no total, cobrindo a máquina de estados, o cálculo de valores, o fluxo de autenticação e os endpoints de pedido — incluindo os casos de recusa.

## O que eu faria com mais tempo

- **Migrations com Flyway** no lugar de `ddl-auto: update`. Funciona para um desafio, mas não é aceitável em produção: não há controle de versão do schema nem caminho de rollback.
- **Refresh token.** Hoje o token expira em 2 horas e o usuário precisa entrar de novo. O front já trata o 401 como sessão expirada, então o encaixe existe.
- **Paginação na listagem.** `GET /api/pedidos` devolve tudo. Com volume real isso não se sustenta.
- **Testes de componente no front** com React Testing Library, cobrindo os quatro estados e o rollback da atualização otimista.
- **Docker Compose** para subir backend e frontend com um comando.
