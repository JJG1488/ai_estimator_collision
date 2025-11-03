# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI-powered collision repair estimation platform** built with Expo React Native. It's a two-sided marketplace connecting body shops with insurance adjusters through automated damage assessment, real-time pricing, and pre-validated estimates.

**Stack**: Expo SDK 54, React 19.1, React Native 0.81.4, TypeScript 5.9
**Platforms**: iOS, Android, Web

## Business Model

- **Body Shops**: $500/month SaaS subscription for unlimited AI estimates
- **Insurance Adjusters**: $2 per claim processed via API
- **Auto-approval**: Claims under $5,000 approved automatically within 24 hours

## Architecture

### Application Structure

The app uses **role-based routing** with separate flows for body shops and insurance adjusters:

```
app/
├── _layout.tsx                    # Root layout with auth providers
├── (auth)/                        # Authentication flow
│   ├── login.tsx                 # Sign in (mock auth)
│   ├── signup.tsx                # Account creation with role selection
│   └── role-selection.tsx        # Body shop vs Insurance adjuster
├── (body-shop)/                   # Body shop user flow
│   ├── (tabs)/
│   │   ├── dashboard.tsx         # Active claims, stats
│   │   ├── new-claim.tsx         # Start estimate workflow
│   │   ├── history.tsx           # Past estimates
│   │   └── settings.tsx          # Account, subscription
│   └── claim/[id]/
│       ├── vehicle-info.tsx      # Vehicle details input
│       ├── photo-capture.tsx     # Multi-angle photo capture
│       ├── damage-assessment.tsx # AI analysis results
│       ├── estimate.tsx          # Generated estimate
│       └── submit.tsx            # Submit to insurance
└── (adjuster)/                    # Insurance adjuster flow
    ├── (tabs)/
    │   ├── pending.tsx           # Claims awaiting review
    │   ├── approved.tsx          # Approved claims history
    │   ├── analytics.tsx         # Fraud metrics, revenue
    │   └── settings.tsx          # Account settings
    └── claim/[id]/
        └── review.tsx            # Approve/reject with fraud detection
```

### State Management

**Contexts** (see `contexts/`):
- `AuthContext`: User authentication, role-based routing
- `ClaimContext`: Active claim state, CRUD operations

**Data Persistence**:
- `@react-native-async-storage/async-storage` for all data
- Claims stored at key `@collision_repair:claims`
- User stored at key `@collision_repair:user`
- Offline-first architecture (no backend in MVP)

### Core Services

All services are **mock implementations** - ready for production API integration:

**`services/mock-ai-service.ts`**
- `analyzeDamage(photos)` - Simulates AI damage detection
- Returns detected damage areas, severity, affected parts, confidence scores
- Processing delay: 2-4 seconds to simulate real API
- Detects hidden damage based on photo angles and damage patterns
- **Production**: Replace with OpenAI Vision, Google Cloud Vision, or custom model

**`services/mock-pricing-service.ts`**
- `getLaborRate(zipCode)` - Regional labor rates ($75-$105/hr)
- `getPartPrice(partName, vehicle)` - Industry-standard parts pricing
- `getPaintCost(panels, blend)` - Paint & refinish calculations
- Vehicle age multiplier for rare/discontinued parts
- **Production**: Integrate with CCC ONE, Mitchell, or Audatex APIs

**`services/estimate-service.ts`**
- `generateEstimate(assessment, vehicle)` - Complete cost calculation
- `formatCCCOne(estimate)` - CCC ONE compatible text format
- `formatMitchell(estimate)` - Mitchell compatible text format
- Includes parts, labor, paint, supplies, tax calculations
- **Production**: Direct API submission to insurance systems

**`services/fraud-detection-service.ts`**
- `analyzeFraud(claim)` - Risk scoring (0-100)
- Checks: estimate amount, photo count, AI confidence, damage severity, vehicle age
- Returns fraud indicators with severity levels
- Auto-flags claims scoring >70 for manual review
- **Production**: ML model integration for pattern detection

### Data Models

**Key types** (see `types/index.ts`):

```typescript
// User roles drive app routing
type UserRole = 'body_shop' | 'insurance_adjuster';

// Claim lifecycle
type ClaimStatus = 'draft' | 'analyzing' | 'pending_review' | 'approved' | 'rejected' | 'supplement_needed';

// Photo requirements
type PhotoAngle = 'front' | 'rear' | 'driver_side' | 'passenger_side' | 'front_driver' | 'front_passenger' | 'rear_driver' | 'rear_passenger' | 'closeup';

// Damage areas map to vehicle parts
type DamageArea = 'front_bumper' | 'hood' | 'fender_left' | 'door_front_left' | ... // 17 areas

// Estimate output formats
type EstimateFormat = 'ccc_one' | 'mitchell';
```

### Theming

- Light/dark mode support via `useColorScheme()` hook
- Theme colors in `constants/theme.ts`
- Platform-specific fonts (iOS system fonts, web font stacks)
- Status-based colors: approved (green), rejected (red), pending (blue)

### Path Aliases

All imports use `@/` prefix:
```typescript
import { Claim } from '@/types';
import { analyzeDamage } from '@/services/mock-ai-service';
import { useAuth } from '@/contexts/auth-context';
```

## Development Commands

```bash
# Start development server
npm start
npx expo start

# Platform-specific
npm run android
npm run ios
npm run web

# Code quality
npm run lint
```

## Photo Capture Workflow

Body shops follow this flow:
1. **Vehicle Info** - Enter year, make, model, VIN
2. **Photo Capture** - Take 4-8 photos (8 angles defined)
   - Uses `expo-image-picker` for camera/gallery access
   - Minimum 4 photos required, all 8 recommended
   - Photos stored locally with metadata (dimensions, timestamp)
3. **AI Analysis** - Mock damage detection (2-4 second delay)
   - Detects 1-5 damage areas based on photo angles
   - Assigns severity (minor/moderate/severe)
   - Identifies affected parts with confidence scores
4. **Estimate Review** - AI-generated repair costs
   - Parts, labor, paint, supplies automatically calculated
   - Tax and shop supplies added
   - CCC ONE/Mitchell formatting
5. **Submit** - Send to insurance for review

## Insurance Review Workflow

Adjusters review submitted claims:
1. **Fraud Analysis** - Automatic risk scoring
   - High-value claims flagged
   - Photo count verification
   - AI confidence validation
   - Damage pattern analysis
2. **Auto-Approval** - Claims under $5K eligible for instant approval
3. **Manual Review** - Claims >$5K require adjuster decision
4. **Approve/Reject** - One-tap workflow with notifications

## Authentication Flow

Mock authentication (no backend):
- Login: Email determines role (contains "adjuster" → insurance, else → body shop)
- Sign up: Select role, stored in AsyncStorage
- Auto-routing based on role:
  - Body shops → `/(body-shop)/(tabs)/dashboard`
  - Adjusters → `/(adjuster)/(tabs)/pending`

## Key Configuration

**app.json**:
- New Architecture enabled
- React Compiler enabled (experimental)
- Typed routes enabled
- Edge-to-edge on Android
- URL scheme: `collisionrepairreactnative://`

**TypeScript**:
- Strict mode enabled
- Path aliases configured

## Production Integration Points

To make this production-ready:

1. **AI/ML Service**:
   - Replace `mock-ai-service.ts` with OpenAI Vision API or Google Cloud Vision
   - Train custom model on auto damage dataset
   - Add image preprocessing and validation

2. **Pricing Database**:
   - Integrate CCC ONE API for OEM parts pricing
   - Add Mitchell or Audatex as alternative
   - Real-time labor rate lookups by zip code

3. **Insurance APIs**:
   - Direct submission to insurance systems
   - Real-time approval webhooks
   - Claims status tracking

4. **Backend**:
   - Replace AsyncStorage with API calls
   - User authentication (Firebase, Auth0)
   - Cloud storage for photos (S3, Cloudinary)
   - PostgreSQL/MongoDB for claims data

5. **Payments**:
   - Stripe integration for body shop subscriptions
   - Insurance API billing automation

6. **Fraud Detection**:
   - Train ML model on historical fraud patterns
   - Duplicate claim detection
   - Biometric photo analysis

## Important Notes

- All data is stored locally (AsyncStorage) - no backend in MVP
- Mock services have realistic delays to simulate API calls
- Photo capture requires camera permissions (requested on first use)
- Claims are shared between body shop and adjuster views via AsyncStorage
- Fraud scores are calculated on-demand when adjusters review claims
- Auto-approval threshold is hardcoded at $5,000
- Labor rates vary by mock region ($75-$105/hr)
- Parts pricing includes 20% markup and vehicle age multiplier
