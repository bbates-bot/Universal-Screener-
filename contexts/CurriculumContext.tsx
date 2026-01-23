/**
 * Curriculum Context Provider
 * Manages curriculum system state and provides context to components
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  CurriculumSystem,
  GradeDisplayRegion,
  CurriculumContextValue,
  CurriculumState,
  GradeLevel,
} from '../types/curriculum';
import {
  CURRICULUM_CONFIGS,
  DEFAULT_CURRICULUM_SYSTEM,
  getCurriculumConfig,
} from '../config/curriculumConfigs';
import { GRADE_LEVEL_LABELS } from '../constants/gradeMappings';

// Create context with undefined default
const CurriculumContext = createContext<CurriculumContextValue | undefined>(undefined);

// Storage key for persisting curriculum selection
const CURRICULUM_STORAGE_KEY = 'cga-screener-curriculum';
const REGION_STORAGE_KEY = 'cga-screener-region';

// Get initial values from localStorage if available
function getInitialSystem(): CurriculumSystem {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (stored && stored in CURRICULUM_CONFIGS) {
      return stored as CurriculumSystem;
    }
  }
  return DEFAULT_CURRICULUM_SYSTEM;
}

function getInitialRegion(system: CurriculumSystem): GradeDisplayRegion {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(REGION_STORAGE_KEY);
    if (stored && ['US', 'UK', 'NZ', 'AU'].includes(stored)) {
      return stored as GradeDisplayRegion;
    }
  }
  return CURRICULUM_CONFIGS[system].defaultRegion;
}

// Provider props
interface CurriculumProviderProps {
  children: ReactNode;
  initialSystem?: CurriculumSystem;
  initialRegion?: GradeDisplayRegion;
}

// Provider component
export function CurriculumProvider({
  children,
  initialSystem,
  initialRegion,
}: CurriculumProviderProps) {
  // Initialize state
  const [currentSystem, setCurrentSystem] = useState<CurriculumSystem>(
    initialSystem || getInitialSystem()
  );
  const [displayRegion, setDisplayRegionState] = useState<GradeDisplayRegion>(
    initialRegion || getInitialRegion(currentSystem)
  );

  // Get current configuration
  const currentConfig = useMemo(
    () => getCurriculumConfig(currentSystem),
    [currentSystem]
  );

  // Set curriculum system with persistence
  const setSystem = useCallback((system: CurriculumSystem) => {
    setCurrentSystem(system);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRICULUM_STORAGE_KEY, system);
    }
    // Update region to default for new system
    const newConfig = getCurriculumConfig(system);
    setDisplayRegionState(newConfig.defaultRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGION_STORAGE_KEY, newConfig.defaultRegion);
    }
  }, []);

  // Set display region with persistence
  const setDisplayRegion = useCallback((region: GradeDisplayRegion) => {
    setDisplayRegionState(region);
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGION_STORAGE_KEY, region);
    }
  }, []);

  // Get grade display based on current region
  const getGradeDisplay = useCallback(
    (gradeLevel: GradeLevel): string => {
      switch (displayRegion) {
        case 'US':
          return gradeLevel.usEquivalent;
        case 'UK':
          return gradeLevel.ukEquivalent;
        case 'NZ':
          return gradeLevel.nzEquivalent;
        case 'AU':
          return gradeLevel.auEquivalent;
        default:
          return gradeLevel.usEquivalent;
      }
    },
    [displayRegion]
  );

  // Get grade level label based on current region/curriculum
  const getGradeLevelLabel = useCallback((): string => {
    // For Edexcel, use "Stage" as the label
    if (currentSystem === 'EDEXCEL_INTERNATIONAL') {
      return currentConfig.gradeLevelLabel;
    }
    // Otherwise use region-specific label
    return GRADE_LEVEL_LABELS[displayRegion];
  }, [currentSystem, currentConfig, displayRegion]);

  // Get qualification label based on current curriculum
  const getQualificationLabel = useCallback((): string => {
    return currentConfig.qualificationLabel;
  }, [currentConfig]);

  // Build context value
  const contextValue: CurriculumContextValue = useMemo(
    () => ({
      currentSystem,
      displayRegion,
      currentConfig,
      setSystem,
      setDisplayRegion,
      getGradeDisplay,
      getGradeLevelLabel,
      getQualificationLabel,
    }),
    [
      currentSystem,
      displayRegion,
      currentConfig,
      setSystem,
      setDisplayRegion,
      getGradeDisplay,
      getGradeLevelLabel,
      getQualificationLabel,
    ]
  );

  return (
    <CurriculumContext.Provider value={contextValue}>
      {children}
    </CurriculumContext.Provider>
  );
}

// Hook to use curriculum context
export function useCurriculum(): CurriculumContextValue {
  const context = useContext(CurriculumContext);
  if (context === undefined) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
}

// Export context for advanced use cases
export { CurriculumContext };
