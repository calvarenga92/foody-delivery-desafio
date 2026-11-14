package com.foody.rastreador.comum;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verificacao de saude para a plataforma de hospedagem: responde 200 sem
 * autenticacao e sem tocar no banco, so para dizer que a aplicacao subiu.
 */
@RestController
class SaudeController {

    @GetMapping("/api/saude")
    Map<String, String> saude() {
        return Map.of("status", "ok");
    }
}
