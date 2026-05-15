package com.tutorgpt.controller;

import com.tutorgpt.dto.ChangePasswordRequest;
import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.dto.UpdateProfileRequest;
import com.tutorgpt.dto.UserDto;
import com.tutorgpt.model.User;
import com.tutorgpt.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(UserDto.from(user));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        user.setName(req.getName());
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of("WRONG_PASSWORD", "Current password is incorrect"));
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
