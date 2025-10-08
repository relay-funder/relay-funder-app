/**
 * Campaign Validation Matrix
 *
 * Maps contract errors to validation stages and user-friendly messages.
 * Prevents invalid states from reaching the blockchain.
 */

export enum ValidationStage {
  DRAFT = 'draft', // Form validation, basic requirements
  PENDING_APPROVAL = 'pending_approval', // Before admin review
  ACTIVE = 'active', // Treasury deployment & configuration
}

export enum ValidationSeverity {
  ERROR = 'error', // Blocks progression
  WARNING = 'warning', // Allows but warns
  INFO = 'info', // Informational only
}

import { DbCampaign } from '@/types/campaign';

export interface ValidationRule {
  id: string;
  stage: ValidationStage;
  severity: ValidationSeverity;
  contractError: string;
  condition: (campaign: DbCampaign) => boolean;
  message: string;
  userMessage: string;
  prevention: string;
}

/**
 * ESSENTIAL CLIENT-SIDE VALIDATION MATRIX
 *
 * Only includes validations that can be performed client-side to prevent
 * predictable on-chain failures. Server-side validations and platform-specific
 * checks are handled by the backend.
 */
export const CAMPAIGN_VALIDATION_RULES: ValidationRule[] = [
  // ========== CAMPAIGN CREATION VALIDATION ==========
  {
    id: 'campaign-required-fields',
    stage: ValidationStage.PENDING_APPROVAL,
    severity: ValidationSeverity.ERROR,
    contractError: 'CampaignInfoFactoryInvalidInput',
    condition: (campaign) =>
      !campaign.title?.trim() ||
      !campaign.description?.trim() ||
      !campaign.fundingGoal ||
      !campaign.creatorAddress ||
      !campaign.startTime ||
      !campaign.endTime,
    message: 'Required campaign fields are missing',
    userMessage: 'Please complete all required campaign fields.',
    prevention: 'Form validation prevents incomplete submissions',
  },

  // ========== TIMING VALIDATION ==========
  {
    id: 'campaign-timing-invalid',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'KeepWhatsRaisedInvalidInput',
    condition: (campaign) => {
      const startTime = new Date(campaign.startTime).getTime();
      const endTime = new Date(campaign.endTime).getTime();
      const now = Date.now();
      return startTime <= now || endTime <= startTime;
    },
    message: 'Campaign timing configuration is invalid',
    userMessage:
      'Campaign start time must be in the future and before end time.',
    prevention: 'Prevents treasury configuration failures',
  },

  {
    id: 'campaign-already-started',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'CurrentTimeIsGreater',
    condition: (campaign) =>
      new Date(campaign.startTime).getTime() <= Date.now(),
    message: 'Campaign start time is in the past',
    userMessage: 'Cannot activate campaign that has already started.',
    prevention: 'Prevents treasury deployment on started campaigns',
  },

  // ========== STATUS VALIDATION ==========
  {
    id: 'campaign-already-active',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'KeepWhatsRaisedAlreadyEnabled',
    condition: (campaign) => campaign.status === 'ACTIVE',
    message: 'Campaign is already active',
    userMessage: 'This campaign is already active and deployed.',
    prevention: 'Prevents duplicate treasury deployments',
  },

  {
    id: 'campaign-disabled',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'DisabledError',
    condition: (campaign) => campaign.status === 'DISABLED',
    message: 'Campaign is currently disabled',
    userMessage: 'Cannot perform operations on a disabled campaign.',
    prevention: 'Prevents operations on disabled campaigns',
  },

  {
    id: 'campaign-failed',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'FailedError',
    condition: (campaign) => campaign.status === 'FAILED',
    message: 'Campaign has failed',
    userMessage: 'Cannot perform operations on a failed campaign.',
    prevention: 'Prevents operations on failed campaigns',
  },

  // ========== CONTRACT DEPLOYMENT VALIDATION ==========
  {
    id: 'campaign-contract-missing',
    stage: ValidationStage.ACTIVE,
    severity: ValidationSeverity.ERROR,
    contractError: 'TreasuryFactoryInvalidAddress',
    condition: (campaign) => !campaign.campaignAddress,
    message: 'Campaign contract not deployed',
    userMessage:
      'Campaign contract must be deployed before treasury operations.',
    prevention: 'Ensures contract exists before treasury interactions',
  },
];

/**
 * Validate campaign against all applicable rules for a given stage
 */
export function validateCampaign(
  campaign: DbCampaign,
  stage: ValidationStage,
): { valid: boolean; errors: ValidationRule[]; warnings: ValidationRule[] } {
  const applicableRules = CAMPAIGN_VALIDATION_RULES.filter(
    (rule) => rule.stage === stage,
  );

  const errors: ValidationRule[] = [];
  const warnings: ValidationRule[] = [];

  for (const rule of applicableRules) {
    if (!rule.condition(campaign)) continue;

    if (rule.severity === ValidationSeverity.ERROR) {
      errors.push(rule);
      continue;
    }

    if (rule.severity === ValidationSeverity.WARNING) {
      warnings.push(rule);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get user-friendly validation summary
 */
export function getValidationSummary(
  campaign: DbCampaign,
  stage: ValidationStage,
): { canProceed: boolean; messages: string[]; severity: ValidationSeverity } {
  const validation = validateCampaign(campaign, stage);

  const messages: string[] = [
    ...validation.errors.map((rule) => `❌ ${rule.userMessage}`),
    ...validation.warnings.map((rule) => `⚠️ ${rule.userMessage}`),
  ];

  const highestSeverity =
    validation.errors.length > 0
      ? ValidationSeverity.ERROR
      : validation.warnings.length > 0
        ? ValidationSeverity.WARNING
        : ValidationSeverity.INFO;

  return {
    canProceed: validation.valid,
    messages,
    severity: highestSeverity,
  };
}
