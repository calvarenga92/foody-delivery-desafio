package com.foody.rastreador.comum;

import com.foody.rastreador.pedido.PedidoNaoEncontradoException;
import com.foody.rastreador.pedido.TransicaoInvalidaException;
import com.foody.rastreador.usuario.CredenciaisInvalidasException;
import com.foody.rastreador.usuario.EmailJaCadastradoException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> dadosInvalidos(MethodArgumentNotValidException ex) {
        List<String> detalhes = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        return ResponseEntity.badRequest()
                .body(ApiError.de("DADOS_INVALIDOS", "Verifique os campos informados", detalhes));
    }

    @ExceptionHandler(PedidoNaoEncontradoException.class)
    public ResponseEntity<ApiError> pedidoNaoEncontrado(PedidoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.de("PEDIDO_NAO_ENCONTRADO", ex.getMessage()));
    }

    @ExceptionHandler(TransicaoInvalidaException.class)
    public ResponseEntity<ApiError> transicaoInvalida(TransicaoInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de("TRANSICAO_INVALIDA", ex.getMessage()));
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<ApiError> emailJaCadastrado(EmailJaCadastradoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de("EMAIL_JA_CADASTRADO", ex.getMessage()));
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ApiError> credenciaisInvalidas(CredenciaisInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.de("CREDENCIAIS_INVALIDAS", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> erroInesperado(Exception ex) {
        log.error("Erro nao tratado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.de("ERRO_INTERNO", "Ocorreu um erro inesperado"));
    }
}
