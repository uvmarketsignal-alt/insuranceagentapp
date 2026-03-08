# UV Insurance Agency

A premium internal insurance agency management platform built for owners and employees only. This application includes a full customer onboarding wizard, approvals workflow, live camera capture, document management with zoom, notifications, compliance tools, and PWA support.

## Highlights

- Owner & employee role-based access (no customer portal)
- Animated login with splash screen and install banners
- 6-step customer onboarding wizard with policy-specific details
- Motor insurance subtype support (Comprehensive, Third Party, Own Damage)
- Automatic IDV-based sum assured for third party motor policies
- Live camera capture with watermark and document upload support
- Customer approval workflow with instant owner notifications
- Document viewer with zoom and rotation controls
- Audit logs, analytics, knowledge base, and compliance reporting
- PWA install with service worker and offline-ready assets
- Dark mode with glass morphism UI and premium animations

## Demo Credentials

**Owner**
- Email: `uv@uvinsurance.in`
- Password: `UV@Owner2025`

**Employees**
- Email: `raghul@uvinsurance.in`
- Password: `Raghul@Emp2025`

- Email: `vasu@uvinsurance.in`
- Password: `Vasu@Emp2025`

## Setup

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Notes

- The database configuration uses Neon PostgreSQL.
- All actions are designed to sync to the database service.
- This is an internal staff application only (no customer login).
