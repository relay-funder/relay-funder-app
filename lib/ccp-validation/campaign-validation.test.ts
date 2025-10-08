import { describe, it, expect } from 'vitest';
import { getValidationSummary, ValidationStage } from './campaign-validation';

describe('Campaign Validation - Essential Client-Side Rules', () => {
  describe('PENDING_APPROVAL Stage - Pre-submission validation', () => {
    it('should pass validation for complete campaign data', () => {
      const validCampaign = {
        title: 'Test Campaign',
        description: 'Test description',
        fundingGoal: '1000000000000000000',
        creatorAddress: '0x1234567890123456789012345678901234567890',
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 * 30),
      };

      const validation = getValidationSummary(
        validCampaign,
        ValidationStage.PENDING_APPROVAL,
      );

      expect(validation.canProceed).toBe(true);
      expect(validation.messages).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidCampaign = {
        title: '', // Empty title
        description: 'Test description',
        fundingGoal: '1000000000000000000',
        creatorAddress: '0x1234567890123456789012345678901234567890',
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 * 30),
      };

      const validation = getValidationSummary(
        invalidCampaign,
        ValidationStage.PENDING_APPROVAL,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) =>
          msg.includes('required campaign fields'),
        ),
      ).toBe(true);
    });

    it('should fail validation for whitespace-only fields', () => {
      const invalidCampaign = {
        title: '   ', // Whitespace only
        description: 'Test description',
        fundingGoal: '1000000000000000000',
        creatorAddress: '0x1234567890123456789012345678901234567890',
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 * 30),
      };

      const validation = getValidationSummary(
        invalidCampaign,
        ValidationStage.PENDING_APPROVAL,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) =>
          msg.includes('required campaign fields'),
        ),
      ).toBe(true);
    });
  });

  describe('ACTIVE Stage - Pre-on-chain validation', () => {
    const baseCampaign = {
      id: 1,
      title: 'Test Campaign',
      description: 'Test description',
      fundingGoal: '1000000000000000000',
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      endTime: new Date(Date.now() + 86400000 * 30), // 30 days from now
      creatorAddress: '0x1234567890123456789012345678901234567890',
      campaignAddress: '0x1234567890123456789012345678901234567890',
      treasuryAddress: null,
    };

    it('should pass validation for valid ACTIVE campaign', () => {
      const validCampaign = {
        ...baseCampaign,
        status: 'PENDING_APPROVAL' as const,
      };

      const validation = getValidationSummary(
        validCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(true);
    });

    it('should fail validation for campaigns that have already started', () => {
      const startedCampaign = {
        ...baseCampaign,
        status: 'PENDING_APPROVAL' as const,
        startTime: new Date(Date.now() - 86400000), // Yesterday
      };

      const validation = getValidationSummary(
        startedCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) => msg.includes('already started')),
      ).toBe(true);
    });

    it('should fail validation for invalid timing (end before start)', () => {
      const invalidTimingCampaign = {
        ...baseCampaign,
        status: 'PENDING_APPROVAL' as const,
        startTime: new Date(Date.now() + 86400000 * 30), // 30 days from now
        endTime: new Date(Date.now() + 86400000), // Tomorrow (before start)
      };

      const validation = getValidationSummary(
        invalidTimingCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) =>
          msg.includes('start time must be in the future'),
        ),
      ).toBe(true);
    });

    it('should fail validation for already active campaigns', () => {
      const activeCampaign = {
        ...baseCampaign,
        status: 'ACTIVE' as const,
      };

      const validation = getValidationSummary(
        activeCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) => msg.includes('already active')),
      ).toBe(true);
    });

    it('should fail validation for paused campaigns', () => {
      const pausedCampaign = {
        ...baseCampaign,
        status: 'PAUSED' as const,
      };

      const validation = getValidationSummary(
        pausedCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) => msg.includes('paused campaign')),
      ).toBe(true);
    });

    it('should fail validation for cancelled campaigns', () => {
      const cancelledCampaign = {
        ...baseCampaign,
        status: 'CANCELLED' as const,
      };

      const validation = getValidationSummary(
        cancelledCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(validation.messages.some((msg) => msg.includes('cancelled'))).toBe(
        true,
      );
    });

    it('should fail validation for campaigns without contract address', () => {
      const noContractCampaign = {
        ...baseCampaign,
        status: 'PENDING_APPROVAL' as const,
        campaignAddress: null,
      };

      const validation = getValidationSummary(
        noContractCampaign,
        ValidationStage.ACTIVE,
      );

      expect(validation.canProceed).toBe(false);
      expect(
        validation.messages.some((msg) =>
          msg.includes('contract must be deployed'),
        ),
      ).toBe(true);
    });
  });
});
