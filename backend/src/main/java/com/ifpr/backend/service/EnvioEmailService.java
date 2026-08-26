
package com.ifpr.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EnvioEmailService{

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void enviarEmail(String destinatario, String assunto, String texto) {
       SimpleMailMessage mensagem = new SimpleMailMessage();
       mensagem.setTo(destinatario);
        mensagem.setSubject(assunto);
        mensagem.setText(texto);
        javaMailSender.send(mensagem);
    }

    public void enviarEmailTemplate(String destinatario, String assunto, String template, Context contexto) {
        String templateString = templateEngine.process(template, contexto);
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper;
        try{
            helper = new MimeMessageHelper(message, true);
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(templateString, true);
        } catch (MessagingException e){
            e.printStackTrace();
        }

    }


}