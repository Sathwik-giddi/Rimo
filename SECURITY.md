# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in this
project, please report it privately before disclosing it publicly.

**Do not open a public issue for security vulnerabilities.**

### How to report

- Email: **sathwikgiddi01@gmail.com**
- Include: the affected version, a description of the issue, and — if possible —
  a minimal proof of concept.

You should receive a response within **3 business days**. If the issue is
confirmed, a fix will be coordinated and a security advisory will be published
once resolved.

## Security Best Practices

- **Never commit real API keys.** Use the `.env.example` template and keep
  secrets in `.env.local` (gitignored).
- **Rotate keys** before sharing a deployment publicly.
- Rimo makes **read-only** web requests to publicly disclosed data and does
  not execute code from scanned content.
