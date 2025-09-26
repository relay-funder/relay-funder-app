# CampaignCard Component

## ✨ Modern, Clean Design

The `CampaignCard` component features a redesigned, modern aesthetic with improved user experience:

- **Clean Layout**: No more title truncation issues - title gets full width
- **Better Information Hierarchy**: Creator, category, and content properly organized
- **Clickable Cards**: Entire card navigates to campaign (except admin mode)
- **Simplified Interface**: Removed unnecessary buttons and clutter
- **Professional Typography**: Better spacing and readable text
- **Smart Badge Display**: Status badges only visible to admin users (regular users only see active campaigns)
- **Clean User Experience**: No redundant "Active" badges for regular users exploring campaigns

## CreateCampaignPlaceholder

A dedicated placeholder component for "Create Campaign" actions that replaces the confusing practice of reusing campaign cards:

- **Clear Purpose**: Obvious "create campaign" design with proper visual cues
- **Modern Design**: Gradient background, dashed border, and inviting icons
- **Consistent Sizing**: Matches campaign card dimensions for grid layouts
- **Better UX**: No confusion with actual campaign data

## CampaignRoundBadge

Enhanced display component for matching fund rounds that replaces the simple rocket icon:

- **Rich Information**: Shows round name, status (active/upcoming/past), and count
- **Visual Hierarchy**: Prominent placement with appropriate styling
- **Multiple Variants**: `detailed`, `compact`, and `minimal` display modes
- **Status Indicators**: Clear visual cues for active (🔥), upcoming (⏳), and past (✅) rounds
- **Smart Priority**: Automatically shows most relevant round (active → upcoming → past)

```tsx
import { CreateCampaignPlaceholder } from '@/components/campaign/campaign-card';

function MyDashboard() {
  const handleCreate = () => {
    // Navigate to campaign creation
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <CreateCampaignPlaceholder onCreate={handleCreate} />
      {/* Regular campaign cards */}
    </div>
  );
}
```

## Overview

The `CampaignCard` component is a unified, composable component for displaying campaign cards across the application. It uses a type-based approach for common configurations with fine-grained override options.

## Features

- **Type-based Configuration**: Use predefined types (`standard`, `dashboard`, `admin`, `compact`) for common use cases
- **Composable Architecture**: Built from smaller, focused subcomponents for maintainability
- **Fine-grained Control**: Override display options for custom configurations
- **Backward Compatibility**: Convenience exports maintain existing API patterns

## Basic Usage

```tsx
import { CampaignCard } from '@/components/campaign/campaign-card';

// Standard campaign card
<CampaignCard campaign={campaign} />
```

## Type Configurations

### Standard (Default)
Basic campaign card with donate functionality:

```tsx
<CampaignCard 
  campaign={campaign} 
  type="standard" 
/>
```

### Dashboard
User dashboard with favorite and management features:

```tsx
<CampaignCard 
  campaign={campaign} 
  type="dashboard"
  isFavorite={isFavorite}
  actionHandlers={{ onFavoriteToggle: handleFavoriteToggle }}
/>
```

### Admin
Administrative interface with contract information and management actions:

```tsx
<CampaignCard 
  campaign={campaign} 
  type="admin"
  actionHandlers={{ 
    onApprove: handleApprove,
    onDisable: handleDisable 
  }}
/>
```

### Compact
Compact layout for list views:

```tsx
<CampaignCard 
  campaign={campaign} 
  type="standard"
  displayOptions={{
    useCardImage: true,
    showCategoryBadge: false,
    layoutVariant: 'compact'
  }}
/>
```

## Advanced Configuration

### Custom Display Options
Override default display behavior:

```tsx
<CampaignCard 
  campaign={campaign}
  type="standard"
  displayOptions={{
    showDates: true,
    showTreasuryBalance: true,
    truncateDescription: false
  }}
/>
```

### Custom Actions
Provide custom button implementation:

```tsx
<CampaignCard 
  campaign={campaign}
  customButtons={
    <div className="flex gap-2">
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleDelete}>Delete</Button>
    </div>
  }
/>
```

### Disabled State
Disable all interactive elements:

```tsx
<CampaignCard 
  campaign={campaign}
  disabled={true}
/>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `campaign` | `DbCampaign` | - | Campaign data to display |
| `type` | `'standard' \| 'dashboard' \| 'admin' \| 'compact'` | `'standard'` | Card type configuration |
| `isFavorite` | `boolean` | - | Whether campaign is favorited (dashboard type) |
| `actionHandlers` | `CampaignCardActions` | `{}` | Event handlers for card interactions |
| `displayOptions` | `Partial<CampaignCardDisplayOptions>` | `{}` | Override display options |
| `customButtons` | `React.ReactNode` | - | Custom button implementation |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Custom content for card body |

## Action Handlers

```tsx
interface CampaignCardActions {
  onEdit?: (campaign: DbCampaign) => Promise<void>;
  onDelete?: (campaign: DbCampaign) => Promise<void>;
  onTogglePublish?: (campaign: DbCampaign) => Promise<void>;
  onApprove?: (campaign: DbCampaign) => Promise<void>;
  onDisable?: (campaign: DbCampaign) => Promise<void>;
  onFavoriteToggle?: (isFavorite: boolean) => Promise<void>;
  onCreate?: () => Promise<void>;
  onSelect?: (campaign: DbCampaign) => Promise<void>;
}
```

## Display Options

```tsx
interface CampaignCardDisplayOptions {
  showFavoriteButton?: boolean;
  showRemoveButton?: boolean;
  showStatusBadge?: boolean;
  showCategoryBadge?: boolean;
  showDates?: boolean;
  showRoundsIndicator?: boolean;
  showTreasuryBalance?: boolean;
  showContractAddresses?: boolean;
  showDonateButton?: boolean;
  showStatusBasedButton?: boolean;
  truncateDescription?: boolean;
  useCardImage?: boolean;
  openLinksInNewTab?: boolean;
}
```

## Backward Compatibility

For existing code, convenience exports are available:

```tsx
import { 
  CampaignCardStandard,
  CampaignCardDashboard, 
  CampaignCardAdmin,
  CampaignCardItem,
  CampaignCardFallback
} from '@/components/campaign/campaign-card';

// These work with existing props
<CampaignCardDashboard campaign={campaign} isFavorite={true} />
<CampaignCardAdmin campaign={campaign} />
```

## Migration Guide

### From Legacy Components

| Legacy Component | New Usage | Notes |
|------------------|-----------|--------|
| `CampaignCardDashboard` | `<CampaignCard type="dashboard" />` | Use convenience export or type prop |
| `CampaignItem` | `<CampaignCard type="standard" />` | Default type |
| `CampaignItemCard` | `<CampaignCard type="standard" displayOptions={{ useCardImage: true, showCategoryBadge: false, layoutVariant: 'compact' }} />` | Compact layout |
| `CampaignCardAdmin` | `<CampaignCard type="admin" />` | Admin functionality |
| `CampaignCardFallback` | `<CampaignCard campaign={undefined} />` | Fallback state |

### Common Migration Patterns

```tsx
// OLD: Multiple imports and components
import { CampaignCardDashboard } from '@/components/campaign/card-dashboard';
import { CampaignCardAdmin } from '@/components/campaign/card-admin';

// NEW: Single import with type-based usage
import { CampaignCard } from '@/components/campaign/campaign-card';

<CampaignCard type="dashboard" campaign={campaign} />
<CampaignCard type="admin" campaign={campaign} />
```

## Performance Considerations

- Subcomponents are internally memoized for optimal re-rendering
- Conditional rendering based on display options reduces unnecessary DOM
- Single component import reduces bundle splitting overhead

## Testing

```tsx
import { render } from '@testing-library/react';
import { CampaignCard } from '@/components/campaign/campaign-card';

test('renders standard campaign card', () => {
  render(<CampaignCard campaign={mockCampaign} />);
  // Test standard functionality
});

test('renders admin features when admin type', () => {
  render(<CampaignCard campaign={mockCampaign} type="admin" />);
  // Test admin-specific features
});

test('handles custom actions', () => {
  const onEdit = jest.fn();
  render(
    <CampaignCard 
      campaign={mockCampaign} 
      actionHandlers={{ onEdit }}
    />
  );
  // Test custom action handling
});
```
