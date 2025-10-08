# Campaign Validation Matrix

This document outlines the **essential client-side validation system** that prevents predictable blockchain errors by validating campaign data before on-chain operations.

## Overview

The validation matrix focuses on **7 essential client-side rules** that prevent gas-wasting failures. Server-side validations (authorization, platform setup) are handled by the backend. This lean approach ensures reliable campaign publication while avoiding overcomplicated logic.

## Validation Stages

### 1. **PENDING_APPROVAL** - Pre-Submission Validation
- **Purpose**: Ensure campaign data is complete before admin review
- **Timing**: Before submission for approval
- **Scope**: Required field validation
- **Impact**: Prevents incomplete submissions

### 2. **ACTIVE** - Pre-On-Chain Validation
- **Purpose**: Validate before treasury deployment and blockchain interactions
- **Timing**: Before on-chain operations
- **Scope**: Timing, status, and contract deployment checks
- **Impact**: Prevents gas-wasting on-chain failures

## Essential Validation Rules

### 🚨 **Blocking Validations (ERROR - Prevents Action)**

| Validation ID | Stage | Contract Error | User Message |
|---------------|-------|---------------|--------------|
| `campaign-required-fields` | PENDING_APPROVAL | CampaignInfoFactoryInvalidInput | Please complete all required campaign fields. |
| `campaign-timing-invalid` | ACTIVE | KeepWhatsRaisedInvalidInput | Campaign start time must be in the future and before end time. |
| `campaign-already-started` | ACTIVE | CurrentTimeIsGreater | Cannot activate campaign that has already started. |
| `campaign-already-active` | ACTIVE | KeepWhatsRaisedAlreadyEnabled | This campaign is already active and deployed. |
| `campaign-paused` | ACTIVE | PausedError | Cannot perform operations on a paused campaign. |
| `campaign-cancelled` | ACTIVE | CancelledError | Cannot perform operations on a cancelled campaign. |
| `campaign-contract-missing` | ACTIVE | TreasuryFactoryInvalidAddress | Campaign contract must be deployed before treasury operations. |

### ⚠️ **Warning Validations (WARNING - Allows with Caution)**

| Validation ID | Stage | Contract Error | User Message |
|---------------|-------|---------------|--------------|
| `campaign-ended-warning` | ACTIVE | CurrentTimeIsLess | This campaign has already ended. |

### 🔒 **Server-Handled Validations**

- **Authorization**: User permissions, admin access (handled by auth middleware)
- **Platform Setup**: Global parameters, platform configuration (handled by backend)
- **Contract Deployment**: Treasury implementation setup (handled by deployment scripts)

## Usage Examples

### Form Validation (PENDING_APPROVAL Stage)

```typescript
import { validateCampaignForSubmission } from '@/components/campaign/create/form';

// Before form submission
const { isValid, errors, warnings } = validateCampaignForSubmission(formData);
if (!isValid) {
  errors.forEach(error => showError(error));
}
```

### Admin Approval (ACTIVE Stage)

```typescript
import { getValidationSummary, ValidationStage } from '@/lib/ccp-validation/campaign-validation';

// Before treasury operations
const validation = getValidationSummary(campaign, ValidationStage.ACTIVE);
if (!validation.canProceed) {
  throw new Error(`Campaign validation failed: ${validation.messages[0]}`);
}
```

## Implementation Benefits

### ✅ **Prevents Gas-Wasting Failures**
- 8 essential client-side validations prevent predictable on-chain failures
- Zero preventable gas waste from timing/status errors
- Reliable campaign publication without random failures

### ✅ **Clean Architecture**
- Clear separation: client-side (predictable) vs server-side (auth/platform)
- Lean validation matrix focused on application flows
- No overcomplicated assumptions or unnecessary checks

### ✅ **User Experience**
- Clear, actionable error messages
- Validation happens at the right time in the user journey
- Warnings allow flexibility while errors prevent failures

### ✅ **Maintainable Code**
- Focused on essential validations only
- Easy to understand and modify
- Comprehensive test coverage for all rules

## Adding New Validations

Only add validations that:
1. Can be checked client-side
2. Prevent predictable on-chain failures
3. Are part of core application flows

```typescript
{
  id: 'new-validation-rule',
  stage: ValidationStage.ACTIVE, // PENDING_APPROVAL or ACTIVE
  severity: ValidationSeverity.ERROR, // ERROR blocks, WARNING allows
  contractError: 'ContractErrorName', // Maps to actual contract error
  condition: (campaign) => /* boolean check */,
  message: 'Technical description',
  userMessage: 'User-friendly message',
  prevention: 'How this prevents the error',
}
```

## Testing

Run comprehensive validation tests:

```bash
# Test all validation rules
pnpm test lib/ccp-validation/campaign-validation.test.ts

# Test passes for valid campaigns
# Test blocks for invalid timing, missing fields, wrong status
# Test warns for ended campaigns
```
