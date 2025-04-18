import analytics from './analytics';

// Types of experiments we can run
export enum ExperimentType {
  SubscriptionPricing = 'subscription_pricing',
  FeatureVisibility = 'feature_visibility',
  UiVariant = 'ui_variant',
  CopyVariant = 'copy_variant',
  Onboarding = 'onboarding_flow'
}

// Variants for subscription pricing
export enum PricingVariant {
  Standard = 'standard',             // Original pricing
  Discount = 'discount',             // Lower prices
  Premium = 'premium',               // Higher prices with more features
  Simplified = 'simplified',         // Fewer tiers
  RegionalAdjusted = 'regional'      // Region-specific pricing
}

// A single experiment configuration
interface Experiment<T extends string> {
  id: string;
  type: ExperimentType;
  variants: T[];
  weights?: number[];  // Optional weights for non-uniform distribution
  active: boolean;
}

// User's assigned variant for an experiment
interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

/**
 * A/B Testing service to manage experiments
 */
class ABTestingService {
  private static instance: ABTestingService;
  private experiments: Map<string, Experiment<string>> = new Map();
  private assignments: Map<string, ExperimentAssignment> = new Map();
  private storageKey = 'strangerwave_experiments';
  
  private constructor() {
    this.loadAssignments();
  }
  
  public static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }
  
  /**
   * Register an experiment
   */
  public registerExperiment<T extends string>(
    id: string, 
    type: ExperimentType, 
    variants: T[], 
    weights?: number[],
    active = true
  ): void {
    // Validate weights if provided
    if (weights && weights.length !== variants.length) {
      console.error(`Invalid weights for experiment ${id}. Must match number of variants.`);
      return;
    }
    
    if (weights) {
      const sum = weights.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.0001) {
        console.error(`Weights for experiment ${id} must sum to 1.`);
        return;
      }
    }
    
    this.experiments.set(id, {
      id,
      type,
      variants,
      weights,
      active
    });
    
    if (import.meta.env.DEV) {
      console.log(`Registered experiment: ${id} with variants:`, variants);
    }
  }
  
  /**
   * Get the assigned variant for a user in an experiment
   */
  public getVariant<T extends string>(experimentId: string, defaultVariant: T): T {
    const experiment = this.experiments.get(experimentId);
    
    // If experiment doesn't exist or is not active, return default
    if (!experiment || !experiment.active) {
      return defaultVariant;
    }
    
    // Check if user already has an assignment
    const existingAssignment = this.assignments.get(experimentId);
    if (existingAssignment) {
      return existingAssignment.variant as T;
    }
    
    // Assign a new variant
    const variant = this.assignVariant(experiment);
    
    // Record the assignment
    const assignment: ExperimentAssignment = {
      experimentId,
      variant,
      assignedAt: Date.now()
    };
    
    this.assignments.set(experimentId, assignment);
    this.saveAssignments();
    
    // Track the assignment in analytics
    analytics.trackEvent('experiment_assignment', {
      experiment_id: experimentId,
      experiment_type: experiment.type,
      variant,
    });
    
    return variant as T;
  }
  
  /**
   * Track a conversion for an experiment
   */
  public trackConversion(experimentId: string, conversionType: string, conversionValue?: number): void {
    const assignment = this.assignments.get(experimentId);
    
    if (!assignment) {
      if (import.meta.env.DEV) {
        console.warn(`No assignment found for experiment ${experimentId}`);
      }
      return;
    }
    
    // Track the conversion in analytics
    analytics.trackEvent('experiment_conversion', {
      experiment_id: experimentId,
      experiment_type: this.experiments.get(experimentId)?.type || 'unknown',
      variant: assignment.variant,
      conversion_type: conversionType,
      conversion_value: conversionValue,
    });
  }
  
  /**
   * Manually set variant for an experiment (useful for testing or forcing a specific experience)
   */
  public setVariant(experimentId: string, variant: string): void {
    const experiment = this.experiments.get(experimentId);
    
    if (!experiment) {
      console.error(`Experiment ${experimentId} not found`);
      return;
    }
    
    if (!experiment.variants.includes(variant)) {
      console.error(`Invalid variant ${variant} for experiment ${experimentId}`);
      return;
    }
    
    const assignment: ExperimentAssignment = {
      experimentId,
      variant,
      assignedAt: Date.now()
    };
    
    this.assignments.set(experimentId, assignment);
    this.saveAssignments();
    
    // Track the manual assignment in analytics
    analytics.trackEvent('experiment_manual_assignment', {
      experiment_id: experimentId,
      experiment_type: experiment.type,
      variant,
    });
  }
  
  /**
   * Reset experiment assignments for a user
   */
  public resetAssignments(): void {
    this.assignments.clear();
    localStorage.removeItem(this.storageKey);
    
    // Track reset in analytics
    analytics.trackEvent('experiment_reset', {
      timestamp: Date.now()
    });
  }
  
  /**
   * Determine if a user is in a specific variant of an experiment
   */
  public isInVariant(experimentId: string, variant: string): boolean {
    const assignment = this.assignments.get(experimentId);
    return assignment?.variant === variant;
  }
  
  /**
   * Get all active experiments
   */
  public getActiveExperiments(): Experiment<string>[] {
    return Array.from(this.experiments.values()).filter(exp => exp.active);
  }
  
  /**
   * Get user's current experiment assignments
   */
  public getUserAssignments(): { [experimentId: string]: string } {
    const result: { [experimentId: string]: string } = {};
    
    this.assignments.forEach((assignment, experimentId) => {
      result[experimentId] = assignment.variant;
    });
    
    return result;
  }
  
  /**
   * Assign a variant based on the experiment configuration
   */
  private assignVariant(experiment: Experiment<string>): string {
    const { variants, weights } = experiment;
    
    // If weights are defined, use weighted random selection
    if (weights) {
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
          return variants[i];
        }
      }
      
      // Fallback to the last variant if there's any floating point issues
      return variants[variants.length - 1];
    }
    
    // Otherwise, use uniform selection
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }
  
  /**
   * Load experiment assignments from localStorage
   */
  private loadAssignments(): void {
    try {
      const savedAssignments = localStorage.getItem(this.storageKey);
      
      if (savedAssignments) {
        const parsed = JSON.parse(savedAssignments) as ExperimentAssignment[];
        
        parsed.forEach(assignment => {
          this.assignments.set(assignment.experimentId, assignment);
        });
        
        if (import.meta.env.DEV) {
          console.log('Loaded experiment assignments:', this.assignments);
        }
      }
    } catch (error) {
      console.error('Error loading experiment assignments:', error);
    }
  }
  
  /**
   * Save experiment assignments to localStorage
   */
  private saveAssignments(): void {
    try {
      const assignments = Array.from(this.assignments.values());
      localStorage.setItem(this.storageKey, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving experiment assignments:', error);
    }
  }
}

// Create singleton instance
const abTesting = ABTestingService.getInstance();

// Register default experiments
abTesting.registerExperiment(
  'subscription_pricing_test',
  ExperimentType.SubscriptionPricing,
  [
    PricingVariant.Standard,
    PricingVariant.Discount,
    PricingVariant.Premium,
    PricingVariant.Simplified
  ],
  [0.4, 0.3, 0.15, 0.15] // 40% see standard, 30% see discount, etc.
);

export default abTesting;