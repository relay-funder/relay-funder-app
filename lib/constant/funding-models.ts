export interface FundingModel {
  id: string;
  name: string;
  icon: string;
}
export const fundingModels: FundingModel[] = [
  { id: 'flexible', name: 'Flexible', icon: '🎨' },
  { id: 'all-or-nothing', name: 'All-or-Nothing', icon: '🎨' },
];
