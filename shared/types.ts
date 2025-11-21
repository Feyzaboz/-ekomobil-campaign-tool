// Shared types between frontend and backend

export enum BrandStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export enum BenefitType {
  DOUBLE_REFUND_VALUE = 'DOUBLE_REFUND_VALUE',
  DOUBLE_CASHBACK_RATE = 'DOUBLE_CASHBACK_RATE',
  CUSTOM_TEXT = 'CUSTOM_TEXT',
}

export enum Platform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export interface Integrator {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: number;
  name: string;
  status: BrandStatus;
  categoryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandOffer {
  id: number;
  brandId: number;
  integratorId: number;
  ekomobilRate: number;
  userRate: number;
  isActive: boolean;
  isBestOffer: boolean;
  validFrom?: Date;
  validTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryOffer {
  id: number;
  categoryId: number;
  integratorId: number;
  ekomobilRate: number;
  userRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDefinition {
  id: number;
  name: string;
  description: string;
  minAppOpenCount?: number;
  appOpenWindowDays?: number;
  minRefundCount?: number;
  refundWindowDays?: number;
  extraFilters?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  eventId: number;
  benefitType: BenefitType;
  benefitValue?: number;
  platforms: Platform[];
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  termsAndConditions: string;
  imageUrl?: string;
  targetCampaignId?: number;
  targetPlatforms: Platform[];
  scheduledAt: Date;
  expiresAt?: Date;
  status: AnnouncementStatus;
  createdAt: Date;
  updatedAt: Date;
}

