import { Category } from '@/types';

export const categories: readonly [Category, ...Category[]] = [
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'economic-development', name: 'Economic Development', icon: '💼' },
  { id: 'climate-resilience', name: 'Climate Resilience', icon: '🌱' },
  { id: 'health', name: 'Health & Medical', icon: '🏥' },
  { id: 'water-sanitation', name: 'Water & Sanitation', icon: '💧' },
  { id: 'agriculture', name: 'Agriculture & Food', icon: '🌾' },
  { id: 'emergency-relief', name: 'Emergency Relief', icon: '🚨' },
  { id: 'general-aid', name: 'General Aid', icon: '🤝' },
];
