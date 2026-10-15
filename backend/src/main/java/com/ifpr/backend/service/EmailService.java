package com.ifpr.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final String remetente;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.frontend-url}") String frontendUrl,
                        @Value("${spring.mail.username}") String remetente) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.remetente = remetente;
    }

    public void enviarRecuperacaoSenha(String destinatario, String token) {
        String link = frontendUrl + "/redefinir-senha/" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(remetente);
        msg.setTo(destinatario);
        msg.setSubject("Mercúrio - Redefinição de senha");
        msg.setText("Recebemos um pedido para redefinir sua senha.\n\n"
                + "Clique no link abaixo para criar uma nova senha:\n" + link + "\n\n"
                + "Se você não fez essa solicitação, ignore este e-mail.");

        mailSender.send(msg);
    }
}