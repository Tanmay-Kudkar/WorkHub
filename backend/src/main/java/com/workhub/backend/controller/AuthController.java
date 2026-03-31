package com.workhub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workhub.backend.dto.GoogleAuthRequestDto;
import com.workhub.backend.dto.LoginRequestDto;
import com.workhub.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequestDto req) {
    return authService.login(req);
  }

  @PostMapping("/google")
  public ResponseEntity<?> google(@RequestBody GoogleAuthRequestDto req) {
    return authService.google(req);
  }

  @GetMapping("/google/start")
  public ResponseEntity<?> googleStart(@RequestParam(defaultValue = "login") String mode) {
    return authService.googleStart(mode);
  }

  @GetMapping("/google/callback")
  public ResponseEntity<?> googleCallback(
      @RequestParam(required = false) String code,
      @RequestParam(required = false) String state,
      @RequestParam(name = "error", required = false) String providerError,
      @RequestParam(name = "error_description", required = false) String providerErrorDescription) {
    return authService.googleCallback(code, state, providerError, providerErrorDescription);
  }

  @GetMapping("/google/exchange")
  public ResponseEntity<?> googleExchange(@RequestParam("token") String token) {
    return authService.googleExchange(token);
  }
}
