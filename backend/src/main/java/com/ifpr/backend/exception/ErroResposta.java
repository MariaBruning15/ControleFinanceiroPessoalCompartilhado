package com.ifpr.backend.exception;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class ErroResposta {
    public int status;
    public String mensagem; 
    private LocalDateTime dataHora;
}