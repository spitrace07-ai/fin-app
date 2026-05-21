# FinTrust Bank CTF

FinTrust Bank is a modern digital banking platform designed for high-security financial transactions. This application is a Capture The Flag (CTF) challenge designed for cybersecurity training, containing intentional vulnerabilities.

## Application Overview

*   **Platform**: Node.js + Express + SQLite
*   **Branding**: FinTrust - "Secure Digital Banking Platform"
*   **Target Audience**: Security Auditors / CTF Players

## Project Structure

```text
ctf-finance-app/
├── public/                 # Static assets
│   ├── css/style.css       # Premium blue banking theme
│   ├── js/auth.js          # Authentication helpers
│   ├── js/dashboard.js     # User dashboard logic
│   └── js/transactions.js  # Transaction ledger logic
├── routes/
│   └── app.js              # Page routing
├── views/                  # HTML templates
│   ├── index.html          # Landing page
│   ├── login.html          # Secure login portal
│   └── dashboard.html      # Asset overview
├── server.js               # Core logic, Database & Vulnerabilities
└── README.md               # You are here
```

## Vulnerabilities Included

1.  **HTTP Parameter Pollution (HPP)**: Weak validation on query parameters allows an attacker to manipulate backend queries by providing duplicate parameters.
2.  **Authentication Bypass (User-Agent Spoofing)**: Sensitive administrative endpoints protected only by easily spoofed HTTP headers (User-Agent).

---
*Disclaimer: This application is for educational purposes only. Do not use these patterns in production environments.*
