package com.bikeparts.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bikeparts.exception.ResourceNotFoundException;
import com.bikeparts.model.User;
import com.bikeparts.repository.UserRepository;
// import com.bikeparts.service.MailService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth/changepassword")
public class ChangePasswordAuthUsers {

     private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<Void> changePassword(@RequestBody Map<String,Object> map , Authentication authentication) {
        String email = authentication.getName();

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            user.get().setPassword(passwordEncoder.encode((String)map.get("password")));
            userRepository.save(user.get());
            return ResponseEntity.ok().build();
        }
                
        
        return ResponseEntity.notFound().build();
        
    }
    
  
}
