# Collision Repair Platform - Technical Architecture

## Overview

AI-powered collision repair estimation platform connecting body shops with insurance adjusters through automated damage assessment and pre-validated estimates.

## User Roles

### Body Shop User
- Capture damage photos
- Review AI-generated damage assessment
- Generate repair estimates
- Submit to insurance for approval
- Track claim status

### Insurance Adjuster
- Review submitted claims
- Auto-approve claims under threshold ($5,000)
- Flag suspicious claims (fraud detection)
- Override/adjust estimates
- Analytics dashboard

## Application Structure

### Navigation Hierarchy

```
Root (_layout.tsx)
├── (auth) - Authentication flow
│   ├── login.tsx
│   ├── signup.tsx
│   └── role-selection.tsx
├── (body-shop) - Body shop user flow
│   ├── (tabs)
│   │   ├── dashboard.tsx - Active claims
│   │   ├── new-claim.tsx - Start new estimate
│   │   └── history.tsx - Past estimates
│   ├── claim/
│   │   ├── [id]/vehicle-info.tsx - Vehicle details
│   │   ├── [id]/photo-capture.tsx - Multi-angle photos
│   │   ├── [id]/damage-assessment.tsx - AI results + manual edits
│   │   ├── [id]/estimate.tsx - Generated estimate
│   │   └── [id]/submit.tsx - Review and submit
└── (adjuster) - Insurance adjuster flow
    ├── (tabs)
    │   ├── pending.tsx - Claims awaiting review
    │   ├── approved.tsx - Approved claims
    │   └── analytics.tsx - Fraud metrics, trends
    └── claim/[id]/review.tsx - Detailed claim review
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  role: 'body_shop' | 'insurance_adjuster';
  companyName: string;
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
  createdAt: Date;
}
```

### Claim
```typescript
interface Claim {
  id: string;
  userId: string;
  vehicle: Vehicle;
  photos: Photo[];
  damageAssessment: DamageAssessment;
  estimate: Estimate;
  status: 'draft' | 'analyzing' | 'pending_review' | 'approved' | 'rejected' | 'supplement_needed';
  fraudScore?: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
```

### Vehicle
```typescript
interface Vehicle {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color?: string;
  mileage?: number;
}
```

### Photo
```typescript
interface Photo {
  id: string;
  uri: string;
  angle: 'front' | 'rear' | 'driver_side' | 'passenger_side' | 'front_driver' | 'front_passenger' | 'rear_driver' | 'rear_passenger' | 'closeup';
  timestamp: Date;
  metadata?: {
    width: number;
    height: number;
    location?: { lat: number; lng: number };
  };
}
```

### DamageAssessment
```typescript
interface DamageAssessment {
  detectedDamages: DetectedDamage[];
  confidence: number;
  processingTime: number;
  potentialHiddenDamage: string[];
}

interface DetectedDamage {
  id: string;
  area: 'front_bumper' | 'hood' | 'fender_left' | 'fender_right' | 'door_front_left' | 'door_front_right' | 'door_rear_left' | 'door_rear_right' | 'quarter_panel_left' | 'quarter_panel_right' | 'rear_bumper' | 'roof' | 'windshield' | 'headlight_left' | 'headlight_right' | 'taillight_left' | 'taillight_right';
  severity: 'minor' | 'moderate' | 'severe';
  damageTypes: ('dent' | 'scratch' | 'crack' | 'shatter' | 'paint' | 'structural')[];
  affectedParts: Part[];
  repairType: 'repair' | 'replace';
  confidence: number;
}
```

### Part
```typescript
interface Part {
  id: string;
  name: string;
  partNumber?: string;
  category: 'body' | 'paint' | 'mechanical' | 'glass' | 'trim';
  price: number;
  laborHours: number;
  laborRate: number;
  repairType: 'repair' | 'replace';
}
```

### Estimate
```typescript
interface Estimate {
  id: string;
  lineItems: EstimateLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  format: 'ccc_one' | 'mitchell';
  generatedAt: Date;
  expiresAt: Date;
}

interface EstimateLineItem {
  type: 'part' | 'labor' | 'paint' | 'supplies';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  partId?: string;
}
```

## Services Layer

### MockAIService (`services/mock-ai-service.ts`)
Simulates AI-powered damage detection
- `analyzeDamage(photos: Photo[]): Promise<DamageAssessment>`
- Uses photo angles to determine likely damage areas
- Returns realistic mock data with confidence scores
- Simulates processing delay (1-3 seconds)

### MockPricingService (`services/mock-pricing-service.ts`)
Industry-standard pricing database simulation
- `getPartPrice(partName: string, vehicle: Vehicle): Promise<number>`
- `getLaborRate(zipCode?: string): Promise<number>`
- Mock database of common parts with price ranges
- Regional labor rate variations

### EstimateService (`services/estimate-service.ts`)
Generates formatted estimates
- `generateEstimate(assessment: DamageAssessment, vehicle: Vehicle): Promise<Estimate>`
- `formatCCCOne(estimate: Estimate): string`
- `formatMitchell(estimate: Estimate): string`
- Calculates totals, tax, supplements

### FraudDetectionService (`services/fraud-detection-service.ts`)
Analyzes claims for fraud indicators
- `analyzeClaim(claim: Claim): Promise<number>` // returns 0-100 fraud score
- Checks: unusual damage patterns, price anomalies, duplicate claims
- Flags for manual review if score > 70

### StorageService (`services/storage-service.ts`)
Local data persistence
- Uses AsyncStorage for user preferences
- Uses expo-file-system for photo storage
- Implements offline-first with sync queue

## UI Components

### Shared Components (`components/shared/`)
- `VehicleCard` - Display vehicle info
- `PhotoGrid` - Multi-photo display with angles
- `DamageMap` - Interactive vehicle diagram
- `EstimateCard` - Summary of estimate
- `StatusBadge` - Claim status indicator
- `CameraCapture` - Multi-angle photo capture flow

### Theme Extensions
- Add brand colors for body shop vs adjuster roles
- Status colors (draft, pending, approved, rejected)
- Charts/graphs for analytics dashboard

## State Management

Using React Context for:
- `AuthContext` - Current user, role, authentication state
- `ClaimContext` - Active claim being created/edited
- `ThemeContext` - Extended from existing theme system

## Monetization Tracking

### Events to Track
- New user signup (with role)
- Claim submitted (body shop)
- Claim processed (insurance)
- Subscription tier (for pricing page)

### Mock Pricing
- Body Shop: $500/month subscription (simulated)
- Insurance API: $2 per claim processed (tracked in analytics)

## Security Considerations

- Role-based access control (body shops can't see adjuster views)
- Photo upload size limits
- Rate limiting on AI analysis
- PII handling for VIN, contact info

## Future Integration Points

### AI/ML Services
- OpenAI Vision API
- Google Cloud Vision API
- Custom trained model for auto damage

### Pricing Databases
- CCC ONE API
- Mitchell API
- Audatex integration

### Insurance Integrations
- Direct claim submission APIs
- Real-time approval workflows
- Payment processing

## Development Phases

**Phase 1: Core MVP (Current)**
- Basic navigation and auth
- Photo capture
- Mock AI analysis
- Simple estimate generation

**Phase 2: Enhanced Features**
- Offline support
- Advanced fraud detection
- Analytics dashboard
- Export formats

**Phase 3: Production Ready**
- Real AI integration
- Real pricing APIs
- Insurance API connections
- Payment processing
