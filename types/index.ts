// User and Role Types
export type UserRole = 'body_shop' | 'insurance_adjuster' | 'customer';

export interface User {
  id: string;
  email: string;
  companyName: string;
  role: UserRole;
  createdAt: Date;
  subscription?: {
    plan: 'free' | 'pro';
    status: 'active' | 'cancelled' | 'past_due';
    billingCycle: 'monthly' | 'annual';
    nextBillingDate?: Date;
  };
}

// Vehicle Types
export interface Vehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  color?: string;
  mileage?: number;
  vin?: string;
}

// Photo Types
export type PhotoAngle =
  | 'front'
  | 'rear'
  | 'driver_side'
  | 'passenger_side'
  | 'front_driver'
  | 'front_passenger'
  | 'rear_driver'
  | 'rear_passenger'
  | 'closeup';

export interface Photo {
  id: string;
  uri: string;
  angle?: PhotoAngle;
  timestamp: Date;
  width?: number;
  height?: number;
}

// Damage Assessment Types
export type DamageArea =
  | 'front_bumper'
  | 'hood'
  | 'fender_left'
  | 'fender_right'
  | 'door_front_left'
  | 'door_front_right'
  | 'door_rear_left'
  | 'door_rear_right'
  | 'quarter_panel_left'
  | 'quarter_panel_right'
  | 'rear_bumper'
  | 'trunk'
  | 'roof'
  | 'windshield'
  | 'headlight_left'
  | 'headlight_right'
  | 'taillight_left'
  | 'taillight_right';

export type DamageSeverity = 'minor' | 'moderate' | 'severe';

export interface DetectedDamage {
  area: DamageArea;
  severity: DamageSeverity;
  confidence: number;
  affectedParts: string[];
  repairType: 'repair' | 'replace';
  isHiddenDamage?: boolean;
}

export interface DamageAssessment {
  id: string;
  detectedDamages: DetectedDamage[];
  confidence: number;
  analyzedAt: Date;
  aiModel: string;
}

// Insurance Types
export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  claimNumber: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  deductible?: number;
}

export type InsuranceInfoStatus = 'none' | 'partial' | 'complete' | 'flagged';

// Estimate Types
export type EstimateFormat = 'ccc_one' | 'mitchell';

export interface EstimateBreakdown {
  parts: number;
  labor: number;
  paint: number;
  shopSupplies: number;
  tax: number;
  total: number;
}

export interface Estimate {
  id: string;
  breakdown: EstimateBreakdown;
  total: number;
  format: EstimateFormat;
  generatedAt: Date;
  formattedEstimate?: string;
}

// Claim Types
export type ClaimStatus =
  | 'draft'
  | 'analyzing'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'supplement_needed';

export interface Claim {
  id: string;
  bodyShopId: string;
  bodyShopName: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: ClaimStatus;
  vehicle: Vehicle;
  photos: Photo[];
  damageAssessment?: DamageAssessment;
  estimate?: Estimate;
  insuranceInfo?: InsuranceInfo;
  insuranceInfoStatus: InsuranceInfoStatus;
  insuranceInfoLastEditedBy?: string;
  insuranceInfoLockedAt?: Date;
  insuranceInfoFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Message and Communication Types
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageAttachment {
  id: string;
  uri: string;
  name: string;
  type: 'image' | 'document' | 'pdf';
  size: number;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  attachments?: MessageAttachment[];
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}

export interface Conversation {
  id: string;
  claimId: string;
  participants: {
    userId: string;
    userName: string;
    userRole: UserRole;
  }[];
  lastMessage?: Message;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType =
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected'
  | 'message_received'
  | 'estimate_ready'
  | 'supplement_needed'
  | 'payment_due'
  | 'payment_received';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  claimId?: string;
  conversationId?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Fraud Detection Types
export interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FraudAnalysis {
  riskScore: number;
  indicators: FraudIndicator[];
  recommendation: 'auto_approve' | 'manual_review' | 'reject';
}
