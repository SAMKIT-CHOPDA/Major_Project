package com.bikeparts.service;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${user.email}")
    private String email;

    public void sendSimpleMail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(email);
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);
        System.out.println("Mail sent!");

    }

    public void sendSimpleMailToMany(String[] to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(email);
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);
        System.out.println("Mail sent!");

    }

    // public void sendMimeEmail(String to, String subject, String htmlBody, String attachmentPath)
    //         throws MessagingException {
    //     MimeMessage message = mailSender.createMimeMessage();

    //     // true = multipart
    //     MimeMessageHelper helper = new MimeMessageHelper(message, true);
    //     helper.setTo(to);
    //     helper.setSubject(subject);
    //     helper.setText(htmlBody, true); // true = HTML
    //     helper.setFrom("your_email@example.com");

    //     // Add attachment
    //     if (attachmentPath != null) {
    //         FileSystemResource file = new FileSystemResource(new File(attachmentPath));
    //         helper.addAttachment(file.getFilename(), file);
    //     }

    //     mailSender.send(message);
    //     System.out.println("MIME email sent successfully!");
    // }

    public void sendMimeEmail(String to,String subject,String htmlBody,String attachmentPath) throws MessagingException
    {
        MimeMessage message = javaMailSender.createMimeMessage();

        MimeMessageHelper messageHelper = new MimeMessageHelper(message, true);

        messageHelper.setTo(to);
        messageHelper.setFrom(email);
        messageHelper.setSubject(subject);
        messageHelper.setText(htmlBody, true);

        if (attachmentPath!=null) {
            FileSystemResource file = new FileSystemResource(new File(attachmentPath));
            messageHelper.addAttachment(attachmentPath, file);
        }

        javaMailSender.send(message);
        System.out.println("MIME mail delivered!");
    }
}
