package com.foody.rastreador.usuario;

public class EmailJaCadastradoException extends RuntimeException {

    public EmailJaCadastradoException(String email) {
        super("Já existe uma conta com o e-mail %s".formatted(email));
    }
}
