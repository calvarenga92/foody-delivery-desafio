package com.foody.rastreador.comum;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String codigo, String mensagem, Instant momento, List<String> detalhes) {

    public static ApiError de(String codigo, String mensagem) {
        return new ApiError(codigo, mensagem, Instant.now(), null);
    }

    public static ApiError de(String codigo, String mensagem, List<String> detalhes) {
        return new ApiError(codigo, mensagem, Instant.now(), detalhes);
    }
}
