# Secure Vault API Security Testing Guide with Expected Outputs

## Start Server

### Bash
```bash
npm run dev
```

### PowerShell
```powershell
npm run dev
```

### Expected Output
```txt
Server running on http://localhost:3000
```

---

# Register User A (Alice)

## Bash
```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Str0ng!Pass1234"}'
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
      email = "alice@test.com"
      password = "Str0ng!Pass1234"
  } | ConvertTo-Json)
```

### Expected Output
```json
{
  "message": "Registration successful."
}
```

---

# Login User A and Save JWT

## Bash
```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Str0ng!Pass1234"}'
```

## PowerShell
```powershell
$aliceLogin = Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
      email = "alice@test.com"
      password = "Str0ng!Pass1234"
  } | ConvertTo-Json)

$aliceToken = $aliceLogin.token

$aliceToken
```

### Expected Output
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

# Create Alice Note

## Bash
```bash
curl -s -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"title":"Alice Secret","body":"Top secret note from Alice"}'
```

## PowerShell
```powershell
$aliceNoteResponse = Invoke-RestMethod `
  -Uri "http://localhost:3000/notes" `
  -Method POST `
  -Headers @{
      Authorization = "Bearer $aliceToken"
  } `
  -ContentType "application/json" `
  -Body (@{
      title = "Alice Secret"
      body  = "Top secret note from Alice"
  } | ConvertTo-Json)

$aliceNoteId = $aliceNoteResponse.note.id

$aliceNoteId
```

### Expected Output
```json
{
  "note": {
    "id": "uuid-note-id",
    "userId": "uuid-user-id",
    "title": "Alice Secret",
    "body": "Top secret note from Alice"
  }
}
```

---

# Register User B (Bob)

## Bash
```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"An0ther!Secure9"}'
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
      email = "bob@test.com"
      password = "An0ther!Secure9"
  } | ConvertTo-Json)
```

### Expected Output
```json
{
  "message": "Registration successful."
}
```

---

# Login User B and Save JWT

## Bash
```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"An0ther!Secure9"}'
```

## PowerShell
```powershell
$bobLogin = Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
      email = "bob@test.com"
      password = "An0ther!Secure9"
  } | ConvertTo-Json)

$bobToken = $bobLogin.token

$bobToken
```

### Expected Output
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

# SQL Injection Attack

## Bash
```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"'\'' OR 1=1 --","password":"doesntmatter"}'
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
      email = "' OR 1=1 --"
      password = "doesntmatter"
  } | ConvertTo-Json)
```

### Expected Output
```json
{
  "errors": {
    "email": [
      "Invalid email"
    ]
  }
}
```

---

# XSS Attack

## Bash
```bash
curl -s -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"title":"","body":"<script>alert(1)</script>"}'
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/notes" `
  -Method POST `
  -Headers @{
      Authorization = "Bearer $aliceToken"
  } `
  -ContentType "application/json" `
  -Body (@{
      title = ""
      body  = "<script>alert(1)</script>"
  } | ConvertTo-Json)
```

### Expected Output
```json
{
  "errors": {
    "title": [
      "String must contain at least 1 character(s)"
    ]
  }
}
```

---

# IDOR Attack

## Bash
```bash
curl -s -X GET http://localhost:3000/notes/note-id-here \
  -H "Authorization: Bearer bob-token-here"
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/notes/$aliceNoteId" `
  -Method GET `
  -Headers @{
      Authorization = "Bearer $bobToken"
  }
```

### Expected Output
```json
{
  "error": "Resource not found."
}
```

---

# Missing Token Attack

## Bash
```bash
curl -s -X GET http://localhost:3000/notes
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/notes" `
  -Method GET
```

### Expected Output
```json
{
  "error": "Authentication required"
}
```

---

# Forged JWT Attack

## Bash
```bash
curl -s -X GET http://localhost:3000/notes \
  -H "Authorization: Bearer fake.jwt.token"
```

## PowerShell
```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/notes" `
  -Method GET `
  -Headers @{
      Authorization = "Bearer fake.jwt.token"
  }
```

### Expected Output
```json
{
  "error": "Invalid or expired token"
}
```

---

# Brute Force Attack

## Bash
```bash
for i in 1 2 3 4 5 6; do
  echo "Attempt $i:"
  curl -s -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"victim@test.com","password":"WrongPassword1!"}'
  echo ""
  echo "---"
done
```

## PowerShell
```powershell
1..6 | ForEach-Object {

    Write-Host "Attempt $_"

    try {

        Invoke-RestMethod `
          -Uri "http://localhost:3000/auth/login" `
          -Method POST `
          -ContentType "application/json" `
          -Body (@{
              email = "victim@test.com"
              password = "WrongPassword1!"
          } | ConvertTo-Json)

    } catch {

        if ($_.Exception.Response) {

            $reader = New-Object System.IO.StreamReader(
                $_.Exception.Response.GetResponseStream()
            )

            $reader.ReadToEnd()

        } else {

            Write-Host $_.Exception.Message
        }
    }

    Write-Host "`n---"
}
```

### Expected Output
```txt
Attempt 1-5:
{"error":"Invalid email or password."}

Attempt 6:
{"error":"Too many authentication attempts. Please try again later."}
```
