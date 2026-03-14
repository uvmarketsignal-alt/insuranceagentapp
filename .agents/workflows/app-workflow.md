---
description: Complete insurance agency application end-to-end workflow covering frontend, backend, database, and automation.
---

# Insurance Agency Application Workflow

This document outlines the comprehensive end-to-end workflow of the insurance agency application.

## 1. Application Initialization
- Frontend application loads in browser.
- React initializes and mounts the root component.
- Zustand store initializes with persisted state checked from `localStorage`.
- Neon database connection is established via environment variables.
- User lands on the login screen based on authentication state.

## 2. Authentication & Session Management
- User enters credentials.
- Frontend validates input format.
- Login action is dispatched to the Zustand store.
- Store normalizes and hashes the password (using bcrypt logic if on server).
- Credentials are compared against the stored user database.
- Authentication token is stored in local state.
- Role is determined as **Owner** or **Employee**.
- Session timestamp is recorded and an audit log entry is created.
- Dashboard route conditionally renders based on the role.

## 3. Dashboard Experience
- **Owner**: Sees full analytics and approvals dashboard.
- **Employee**: Sees a restricted dashboard with personal stats.
- All sample data is loaded from the Neon database into the store state.
- Data persists to local storage for offline capability.

## 4. Customer Onboarding (Wizard)
- User navigates to the New Customer Wizard.
- Progressive form steps collect personal information with validation.
- Policy type selection (Motor, Health, Life, Term, Home, Travel) triggers specific fields.
- **Documents Section**:
    - Activates camera or file upload.
    - Browser permission requested for camera access.
    - Live video stream renders in modal; capture action applies watermark.
    - Images/files are converted to base64 and stored locally with metadata.

## 5. Policy Submission & Approval
- Form submission action is dispatched to the store.
- Store validates required fields.
- **Auto-approval Logic**:
    - Owner submission: Approved immediately.
    - Employee submission: Set to "Pending Approval"; notification sent to owner.
- Customer record is created in Neon PostgreSQL.
- Sensitive identifiers are hashed before storage.
- Unique identifiers are generated for all entities.
- Policy record is created and linked to the customer.
- Commission is auto-calculated based on policy type percentage.
- Renewal record is created based on policy end date.
- Audit log entry and success notification are generated.
- User is redirected to the customer list page.

## 6. Data Synchronization & Persistence
- Data updates reflect immediately in all connected components.
- State changes trigger re-renders automatically.
- Background sync writes to Neon PostgreSQL tables.
- Database layer manages connection pooling and uses prepared statements.
- Errors are caught and logged with user-friendly messages.
- Failed writes fall back to local state with a retry mechanism.

## 7. Operations & Lifecycle Management
- **Approvals**: Owner reviews pending customers; status updates propagate.
- **Claims**: Workflow follows Filed → Review → Approved → Settled → Closed stages.
- **Lead Pipeline**: Progresses through Contacted → Meeting → Proposal → Closed-Won.
- **Renewals**: Application checks end dates daily; urgency levels assigned.
- **Reminders**: Monthly reminders generated on the 1st of each month.
- **Automation**: 
    - Birthday automation matches DOB fields.
    - WhatsApp messages prepared with personalized templates.
    - WhatsApp web link opens for message delivery; logged upon completion.

## 8. Security & Permissions
- Document management enforces role-based permissions.
- Employee access to unauthorized downloads is blocked and logged.
- Owner download audit records all file retrievals.
- Session timeout monitors idle activity (warning at 13 minutes).
- Account lock triggered after failed login thresholds.
- Security events logged with device and geolocation data.

## 9. Analytics & Reporting
- Analytics dashboard aggregates data from store state.
- Predictive insights generated from historical patterns.
- Compliance reports aggregate quarterly and annual data.
- IRDAI report formats generated automatically.

## 10. System Configuration & Maintenance
- **Customization**: Owner updates app name and logo settings; propagates globally.
- **Knowledge Base**: Articles stored with categories and tags; full-text search.
- **PWA Capabilities**: 
    - Manifest configures installable metadata.
    - Service worker caches assets for offline functionality.
    - Install prompts displayed on multiple entry points.
- **Diagnostics**: Error boundaries catch runtime errors; logging provides observability.
- **Optimization**: Code splitting, React Query for caching, and virtualization for long lists.
- **Production**: Assets optimized/minified; environment variables secure configuration.
