
# Hardened API Security Layer (Secure Vault API)

## Overview
Secure Vault API is a hardened Express.js application built using a defense-in-depth approach. The project implements multiple security middleware layers to protect against SQL Injection, XSS, IDOR, brute-force attacks, token forgery, and unauthorized access.

## Security Features
### Layer 1: Input Validation
- Zod schema validation
- Malicious payload filtering

### Layer 2: Authentication
- JWT-based authentication
- Token verification

### Layer 3: Authorization
- Resource ownership validation
- IDOR protection

### Layer 4: Rate Limiting
- Brute-force attack prevention

### Layer 5: Security Logging
- Structured JSON security logs
- Security event monitoring

### Layer 6: Error Handling
- Secure error responses
- No sensitive information leakage

### Advanced Intrusion Detection
- IP reputation tracking
- Automatic blocking of malicious IPs
- Real-time attack correlation

## Attack Simulations
- SQL Injection
- Cross-Site Scripting (XSS)
- IDOR
- Missing Authentication
- JWT Forgery
- Brute-Force Attacks

## Tech Stack
- Node.js
- Express.js
- JWT
- Zod
- Pino Logger
- Express Rate Limit

<img width="960" height="1080" alt="Screenshot 2026-06-04 235242" src="https://github.com/user-attachments/assets/4cc7aa6d-f047-4b39-a84f-0deda24d4fc7" />
