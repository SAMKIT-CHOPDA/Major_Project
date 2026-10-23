package com.bikeparts.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.bikeparts.model.User;
import com.bikeparts.repository.UserRepository;
import com.bikeparts.service.MailService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/email/changepassword")
public class ChangePasswordController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService     mailService;

    @Value("${domain.name}")
    private String domainName;

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1 : Request password reset — generate token, send email
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> requestReset(
            @RequestParam("email") String email) {

        Map<String, Object> response = new HashMap<>();

        // 1. Basic null / blank guard
        if (email == null || email.isBlank()) {
            response.put("message", "Email address is required.");
            return ResponseEntity.badRequest().body(response);
        }

        // 2. Format check
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            response.put("message", "Invalid email address format.");
            return ResponseEntity.badRequest().body(response);
        }

        // 3. Look up user — return generic 200 whether found or not
        //    (security: do not reveal if an email is registered)
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            log.warn("Password reset requested for unknown email: {}", email);
            response.put("message", "If that email is registered, a reset link has been sent.");
            return ResponseEntity.ok(response);
        }

        User user  = opt.get();
        String token = UUID.randomUUID().toString();
        user.setChangePasswordToken(token);

        // 4. Persist token
        try {
            userRepository.save(user);
        } catch (Exception e) {
            log.error("DB error saving reset token for {}: {}", email, e.getMessage());
            response.put("message", "An error occurred while processing your request. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        // 5. Build link  — domain.name must be "localhost:3000" (no scheme prefix)
        String link = "http://" + domainName + "/reset-password?token=" + token;

        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Password Reset</title></head>
                <body style="font-family:Arial;background:#f4f6f8;padding:20px">
                <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;text-align:center">
                  <h2 style="color:#222">Password Reset Request</h2>
                  <p>We received a request to reset your password for your <strong>MotoParts</strong> account.</p>
                  <a href="%s"
                     style="display:inline-block;margin:20px 0;padding:12px 28px;background:#ff6b1a;color:white;text-decoration:none;border-radius:5px;font-weight:bold">
                    Reset Password
                  </a>
                  <p style="color:#555;font-size:14px">
                    This link is single-use. If you did not request this, you can safely ignore this email.
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                  <p style="font-size:12px;color:#999">© 2026 MotoParts</p>
                </div>
                </body>
                </html>
                """.formatted(link);

        // 6. Send email — on failure clear the orphaned token
        try {
            mailService.sendMimeEmail(email, "MotoParts Password Reset Request", htmlBody, null);
            log.info("Password reset email sent to {}", email);
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send reset email to {}: {}", email, e.getMessage());
            user.setChangePasswordToken(null);
            userRepository.save(user);
            response.put("message", "Failed to send reset email. Please verify your email address and try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        response.put("message", "If that email is registered, a reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 : Verify token — called by frontend on ResetPassword page load
    //          FIX: use @RequestParam (GET cannot carry @RequestBody)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @RequestParam("token") String token) {

        Map<String, Object> response = new HashMap<>();

        if (token == null || token.isBlank()) {
            response.put("message", "Token is required.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            Optional<User> user = userRepository.findByChangePasswordToken(token);
            if (user.isEmpty()) {
                response.put("message", "Invalid or expired reset link.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("message", "Token is valid.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error verifying reset token: {}", e.getMessage());
            response.put("message", "A server error occurred while verifying your link. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 : Set new password
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/newpassword")
    public ResponseEntity<Map<String, Object>> newPassword(
            @RequestBody Map<String, Object> request) {

        Map<String, Object> response = new HashMap<>();

        String token    = (String) request.get("token");
        String password = (String) request.get("password");

        // Input validation
        if (token == null || token.isBlank()) {
            response.put("message", "Reset token is missing.");
            return ResponseEntity.badRequest().body(response);
        }
        if (password == null || password.isBlank()) {
            response.put("message", "Password cannot be empty.");
            return ResponseEntity.badRequest().body(response);
        }
        if (password.length() < 6) {
            response.put("message", "Password must be at least 6 characters.");
            return ResponseEntity.badRequest().body(response);
        }

        // Find user by token
        Optional<User> opt = userRepository.findByChangePasswordToken(token);
        if (opt.isEmpty()) {
            response.put("message", "Invalid or expired reset link. Please request a new one.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Update password and clear token
        try {
            User user = opt.get();
            user.setPassword(passwordEncoder.encode(password));
            user.setChangePasswordToken(null);
            userRepository.save(user);
            log.info("Password successfully reset for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to update password: {}", e.getMessage());
            response.put("message", "Failed to update password. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        response.put("message", "Password updated successfully.");
        return ResponseEntity.ok(response);
    }
}