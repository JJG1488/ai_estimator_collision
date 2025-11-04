import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Claim, Vehicle, Photo, DamageAssessment, Estimate, InsuranceInfo, InsuranceInfoStatus } from '@/types';
import { useAuth } from './auth-context';

interface ClaimContextType {
  claims: Claim[];
  activeClaim: Claim | null;
  currentClaim: Claim | null;
  isLoading: boolean;
  createClaim: () => Promise<Claim>;
  updateClaim: (claimId: string, updates: Partial<Claim>) => Promise<void>;
  deleteClaim: (claimId: string) => Promise<void>;
  setActiveClaim: (claim: Claim | null) => void;
  addVehicle: (claimId: string, vehicle: Vehicle) => Promise<void>;
  addPhotos: (claimId: string, photos: Photo[]) => Promise<void>;
  setDamageAssessment: (claimId: string, assessment: DamageAssessment) => Promise<void>;
  setEstimate: (claimId: string, estimate: Estimate) => Promise<void>;
  submitClaim: (claimId: string) => Promise<void>;
  updateInsuranceInfo: (claimId: string, insuranceInfo: InsuranceInfo, userId: string) => Promise<void>;
  flagInsuranceInfo: (claimId: string, flags: string[]) => Promise<void>;
  lockInsuranceInfo: (claimId: string) => Promise<void>;
  validateInsuranceInfo: (insuranceInfo?: InsuranceInfo) => InsuranceInfoStatus;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

const STORAGE_KEY = '@collision_repair:claims';

export function ClaimProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadClaims = useCallback(async () => {
    try {
      const claimsData = await AsyncStorage.getItem(STORAGE_KEY);
      if (claimsData) {
        const parsed = JSON.parse(claimsData);
        // Convert date strings back to Date objects
        const claims = parsed.map((claim: any) => ({
          ...claim,
          createdAt: new Date(claim.createdAt),
          updatedAt: new Date(claim.updatedAt),
          submittedAt: claim.submittedAt ? new Date(claim.submittedAt) : undefined,
          reviewedAt: claim.reviewedAt ? new Date(claim.reviewedAt) : undefined,
          photos: claim.photos.map((photo: any) => ({
            ...photo,
            timestamp: new Date(photo.timestamp),
          })),
        }));

        // Filter claims by user
        const userClaims = claims.filter((c: Claim) => c.userId === user?.id);
        setClaims(userClaims);
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveClaims = useCallback(async (updatedClaims: Claim[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClaims));
      setClaims(updatedClaims.filter((c) => c.userId === user?.id));
    } catch (error) {
      console.error('Failed to save claims:', error);
    }
  }, [user]);

  const getAllClaims = useCallback(async (): Promise<Claim[]> => {
    const claimsData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!claimsData) return [];

    const parsed = JSON.parse(claimsData);
    return parsed.map((claim: any) => ({
      ...claim,
      createdAt: new Date(claim.createdAt),
      updatedAt: new Date(claim.updatedAt),
      submittedAt: claim.submittedAt ? new Date(claim.submittedAt) : undefined,
      reviewedAt: claim.reviewedAt ? new Date(claim.reviewedAt) : undefined,
    }));
  }, []);

  useEffect(() => {
    if (user) {
      loadClaims();
    } else {
      setClaims([]);
      setActiveClaim(null);
    }
  }, [user, loadClaims]);

  const createClaim = useCallback(async (): Promise<Claim> => {
    if (!user) throw new Error('User not authenticated');

    const newClaim: Claim = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      vehicle: {
        year: new Date().getFullYear(),
        make: '',
        model: '',
      }, // Will be filled in next step
      photos: [],
      status: 'draft',
      insuranceInfoStatus: 'none',
      insuranceInfoFlags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const allClaims = await getAllClaims();
    const updatedClaims = [...allClaims, newClaim];
    await saveClaims(updatedClaims);
    setActiveClaim(newClaim);

    return newClaim;
  }, [user, getAllClaims, saveClaims]);

  const updateClaim = useCallback(async (claimId: string, updates: Partial<Claim>) => {
    const allClaims = await getAllClaims();
    const updatedClaims = allClaims.map((claim) =>
      claim.id === claimId
        ? { ...claim, ...updates, updatedAt: new Date() }
        : claim
    );
    await saveClaims(updatedClaims);

    if (activeClaim?.id === claimId) {
      const updated = updatedClaims.find((c) => c.id === claimId);
      setActiveClaim(updated || null);
    }
  }, [getAllClaims, saveClaims, activeClaim]);

  const deleteClaim = useCallback(async (claimId: string) => {
    const allClaims = await getAllClaims();
    const updatedClaims = allClaims.filter((claim) => claim.id !== claimId);
    await saveClaims(updatedClaims);

    if (activeClaim?.id === claimId) {
      setActiveClaim(null);
    }
  }, [getAllClaims, saveClaims, activeClaim]);

  const addVehicle = useCallback(async (claimId: string, vehicle: Vehicle) => {
    await updateClaim(claimId, { vehicle });
  }, [updateClaim]);

  const addPhotos = useCallback(async (claimId: string, photos: Photo[]) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;

    const updatedPhotos = [...claim.photos, ...photos];
    await updateClaim(claimId, { photos: updatedPhotos });
  }, [claims, updateClaim]);

  const setDamageAssessment = useCallback(async (claimId: string, assessment: DamageAssessment) => {
    await updateClaim(claimId, {
      damageAssessment: assessment,
      status: 'pending_review',
    });
  }, [updateClaim]);

  const setEstimate = useCallback(async (claimId: string, estimate: Estimate) => {
    await updateClaim(claimId, { estimate });
  }, [updateClaim]);

  const submitClaim = useCallback(async (claimId: string) => {
    await updateClaim(claimId, {
      status: 'pending_review',
      submittedAt: new Date(),
    });
  }, [updateClaim]);

  const validateInsuranceInfo = useCallback((insuranceInfo?: InsuranceInfo): InsuranceInfoStatus => {
    if (!insuranceInfo) return 'none';

    const hasProvider = !!insuranceInfo.provider;
    const hasPolicy = !!insuranceInfo.policyNumber;
    const hasAgent = !!(insuranceInfo.agentName || insuranceInfo.agentPhone || insuranceInfo.agentEmail);

    if (!hasProvider && !hasPolicy) return 'none';
    if (hasProvider && hasPolicy && hasAgent) return 'complete';
    if (hasProvider && hasPolicy) return 'partial';

    return 'partial';
  }, []);

  const updateInsuranceInfo = useCallback(async (
    claimId: string,
    insuranceInfo: InsuranceInfo,
    userId: string
  ) => {
    const claim = claims.find((c) => c.id === claimId);

    // Check if insurance is locked
    if (claim?.insuranceInfoLockedAt) {
      throw new Error('Insurance information is locked and cannot be modified');
    }

    const status = validateInsuranceInfo(insuranceInfo);

    await updateClaim(claimId, {
      insuranceInfo,
      insuranceInfoStatus: status,
      insuranceInfoLastEditedBy: userId,
    });
  }, [claims, validateInsuranceInfo, updateClaim]);

  const flagInsuranceInfo = useCallback(async (claimId: string, flags: string[]) => {
    await updateClaim(claimId, {
      insuranceInfoFlags: flags,
      insuranceInfoStatus: 'flagged',
    });
  }, [updateClaim]);

  const lockInsuranceInfo = useCallback(async (claimId: string) => {
    await updateClaim(claimId, {
      insuranceInfoLockedAt: new Date(),
    });
  }, [updateClaim]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      claims,
      activeClaim,
      currentClaim: activeClaim,
      isLoading,
      createClaim,
      updateClaim,
      deleteClaim,
      setActiveClaim,
      addVehicle,
      addPhotos,
      setDamageAssessment,
      setEstimate,
      submitClaim,
      updateInsuranceInfo,
      flagInsuranceInfo,
      lockInsuranceInfo,
      validateInsuranceInfo,
    }),
    [claims, activeClaim, isLoading, createClaim, updateClaim, deleteClaim, setActiveClaim, addVehicle, addPhotos, setDamageAssessment, setEstimate, submitClaim, updateInsuranceInfo, flagInsuranceInfo, lockInsuranceInfo, validateInsuranceInfo]
  );

  return (
    <ClaimContext.Provider value={value}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
}
