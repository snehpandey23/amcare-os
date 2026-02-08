# AmCare OS Architecture

## Overview

AmCare OS is a monorepo-based healthcare operations platform built with a modular architecture for scalability and maintainability.

## Architecture Principles

1. **Modular Design**: Separate applications for different user roles and functions
2. **Shared Packages**: Reusable code across applications
3. **Integration Layer**: Isolated integration services
4. **HIPAA Compliance**: Built-in compliance features throughout
5. **Type Safety**: TypeScript throughout for type safety

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Applications                │
├──────────────┬──────────────┬──────────────┬───────────┤
│ Staff        │ Patient      │ Operations   │ Analytics │
│ Dashboard    │ Management   │ Hub          │ Engine    │
└──────┬───────┴──────┬────────┴──────┬───────┴─────┬─────┘
       │              │                │             │
       └──────────────┴────────────────┴─────────────┘
                      │
       ┌──────────────┴──────────────┐
       │      Shared Packages         │
       ├──────────┬──────────┬────────┤
       │ Database │   Auth   │ Audit  │
       └──────────┴──────────┴────────┘
                      │
       ┌──────────────┴──────────────┐
       │      Integration Layer       │
       ├──────┬──────┬──────┬────────┤
       │ Zoho │Klarity│WellSync│Stripe│
       └──────┴──────┴──────┴────────┘
                      │
       ┌──────────────┴──────────────┐
       │      Database (PostgreSQL)   │
       └─────────────────────────────┘
```

## Applications

### Staff Dashboard
- **Purpose**: Daily operations for healthcare staff
- **Features**: Task management, KPIs, team overview
- **Port**: 3001
- **Tech**: React, TypeScript, Vite

### Patient Management
- **Purpose**: Patient records and communication
- **Features**: Patient tracker, secure messaging, forms
- **Port**: 3002
- **Tech**: React, TypeScript, Vite

### Operations Hub
- **Purpose**: Business operations management
- **Features**: Payments, appointments, integrations
- **Port**: 3003
- **Tech**: React, TypeScript, Vite

### Analytics Engine
- **Purpose**: Reporting and insights
- **Features**: Reports, dashboards, compliance reporting
- **Port**: 3004
- **Tech**: React, TypeScript, Vite, Recharts

## Shared Packages

### @amcare/database
- PostgreSQL connection pool
- Database utilities
- Used by all applications and integrations

### @amcare/auth
- JWT token generation and verification
- Password hashing and verification
- Authentication utilities

### @amcare/audit
- HIPAA-compliant audit logging
- Audit trail management
- Compliance reporting

### @amcare/api-client
- Shared API client with authentication
- Request/response interceptors
- Error handling

## Integrations

### Zoho Sync
- Synchronizes contacts, invoices, payments
- OAuth-based authentication
- Scheduled synchronization

### Klarity Sync
- Patient data synchronization
- Treatment plan synchronization
- API key authentication

### WellSync API
- Patient data retrieval
- Treatment data synchronization
- API key authentication

### Stripe Webhook
- Payment event processing
- Subscription management
- Webhook signature verification

## Scripts

### Daily Sync
- Automated daily synchronization with external services
- Error handling and retry logic
- Audit logging

### Report Generation
- Compliance reports (HIPAA)
- Operational reports
- PDF generation

### Error Handling
- Error monitoring
- Error logging
- Alert system

## Data Flow

1. **User Action** → Frontend Application
2. **API Request** → Shared API Client (adds auth token)
3. **Backend Processing** → Uses shared packages (database, auth, audit)
4. **Integration** → External services (if needed)
5. **Audit Logging** → All actions logged automatically
6. **Response** → Back to frontend

## Security

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Encryption**: Data encrypted at rest and in transit
- **Audit Trail**: All actions logged for compliance
- **Input Validation**: Schema validation on all inputs
- **Rate Limiting**: Protection against abuse

## Scalability

- **Horizontal Scaling**: Each app can scale independently
- **Database Pooling**: Connection pooling for efficiency
- **Caching**: Redis for caching (future)
- **Queue System**: Background job processing (future)

## Deployment

- **Development**: All apps run locally with hot reload
- **Production**: Each app deployed independently
- **Docker**: Containerization support (future)
- **Kubernetes**: Orchestration support (future)

## Monitoring

- **Error Tracking**: Error handling scripts
- **Audit Logs**: Comprehensive audit trail
- **Performance**: Application performance monitoring (future)
- **Health Checks**: Health check endpoints (future)
