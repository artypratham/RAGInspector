# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in RAG Inspector, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. Email the maintainer directly at the email address listed on the [GitHub profile](https://github.com/artypratham)
2. Include a detailed description of the vulnerability
3. Include steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

### What to Expect

- Acknowledgment within 48 hours
- A fix or mitigation plan within 7 days for critical issues
- Credit in the release notes (unless you prefer to remain anonymous)

### Scope

The following are in scope:
- Authentication bypass or token leakage
- Cross-site scripting (XSS) in the frontend
- API injection vulnerabilities
- Data exposure between users
- Insecure data storage

The following are out of scope:
- Denial of service (rate limiting is not implemented)
- Issues in third-party dependencies (report upstream)
- Self-XSS or issues requiring physical access

## Security Design

RAG Inspector implements the following security measures:

- JWT-based authentication with server-side verification
- Input sanitization for API parameters (path traversal prevention)
- Automatic session invalidation on 401 responses
- Safe JSON parsing with error recovery
- No eval() or dangerouslySetInnerHTML usage
- Protected routes with auth verification gates
