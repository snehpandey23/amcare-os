# API Specifications

API documentation for all AmCare OS applications and services.

## Applications

### Staff Dashboard API
- Task management endpoints
- KPI data endpoints
- Staff management endpoints

### Patient Management API
- Patient CRUD operations
- Secure messaging endpoints
- Form management endpoints
- Appointment endpoints

### Operations Hub API
- Payment processing endpoints
- Appointment scheduling endpoints
- Integration management endpoints
- Billing endpoints

### Analytics Engine API
- Report generation endpoints
- Data query endpoints
- Dashboard data endpoints

## Integration APIs

### Zoho Sync API
- Contact synchronization
- Invoice synchronization
- Payment synchronization

### Klarity Sync API
- Patient data synchronization
- Treatment plan synchronization

### WellSync API
- Patient data retrieval
- Treatment data synchronization

### Stripe Webhook
- Payment event handling
- Subscription event handling

## Authentication

All APIs use JWT authentication. Include token in Authorization header:
```
Authorization: Bearer <token>
```

## HIPAA Compliance

All API endpoints automatically log to audit trail for HIPAA compliance.
