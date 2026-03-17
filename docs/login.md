### Authentication

- Uses bcryptjs for password hashing
- Session management via HTTP-only cookies
- Role-based access control (admin vs regular users)
- Invite code system for leader registration
- Rate limiting (5 attempts per 15 minutes)
- Input validation with Zod schemas

### Security Features

- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting for login attempts
- Input validation with Zod
- HTTP-only session cookies
- Automatic password hash upgrade (legacy plaintext → bcrypt)
