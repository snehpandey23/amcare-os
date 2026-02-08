# AmCare Operating System

A comprehensive, HIPAA-compliant healthcare operations platform with modular architecture.

## Architecture

```
amcare-os/
├── apps/                    # Frontend applications
│   ├── staff-dashboard      # Daily tasks, KPIs, staff interface
│   ├── patient-management   # Patient tracker, chats, forms
│   ├── operations-hub       # Payments, appointments, integrations
│   ├── analytics-engine     # Reports, insights, dashboards
│   └── oet-lms              # OET exam prep for medical assistants
├── integrations/            # External service integrations
│   ├── zoho-sync           # Zoho CRM/Books synchronization
│   ├── klarity-sync        # Klarity integration
│   ├── wellsync-api        # WellSync API integration
│   └── stripe-webhook      # Stripe payment webhooks
├── packages/                # Shared packages
│   ├── database            # Database client and models
│   ├── auth                # Authentication utilities
│   ├── audit               # Audit logging service
│   └── api-client          # Shared API client
├── scripts/                 # Automation scripts
│   ├── daily-sync          # Daily synchronization tasks
│   ├── report-generation   # Automated report generation
│   └── error-handling      # Error monitoring and handling
└── docs/                    # Documentation
    ├── workflows           # Business workflows
    ├── api-specs           # API specifications
    └── compliance          # HIPAA compliance documentation
```

## Features

- **Multi-App Architecture**: Separate applications for different user roles
- **HIPAA Compliant**: Full audit trail, encryption, access controls
- **Integration Ready**: Pre-built integrations for common healthcare services
- **Automated Workflows**: Scripts for daily operations
- **Comprehensive Analytics**: Reporting and insights engine

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for caching and queues)

### Installation

```bash
npm install
```

### Development

Start all apps in development mode:

```bash
npm run dev
```

Or start individual apps:

```bash
npm run dev --workspace=apps/staff-dashboard
npm run dev --workspace=apps/patient-management
npm run dev --workspace=apps/operations-hub
npm run dev --workspace=apps/analytics-engine
npm run dev --workspace=apps/oet-lms
```

### Running Scripts

```bash
# Daily synchronization
npm run sync:daily

# Generate reports
npm run report:generate
```

## Applications

### Staff Dashboard
Daily task management, KPIs, and staff interface for healthcare operations.

### Patient Management
Patient tracking, secure messaging, form management, and patient records.

### Operations Hub
Payment processing, appointment scheduling, and integration management.

### Analytics Engine
Reports, insights, and data visualization for operations and compliance.

### OET LMS (Medical Assistants)
Learning Management System for Occupational English Test (OET) preparation: Listening, Reading, Writing, and Speaking modules, practice tasks, and progress tracking.

## Integrations

- **Zoho Sync**: Synchronize data with Zoho CRM and Books
- **Klarity Sync**: Integration with Klarity platform
- **WellSync API**: WellSync platform integration
- **Stripe Webhook**: Payment processing webhooks

## Documentation

See `/docs` directory for:
- Workflow documentation
- API specifications
- HIPAA compliance guidelines

## License

Proprietary - AmCare Internal Use Only
