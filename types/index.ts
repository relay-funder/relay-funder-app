export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CollectionItemDetail {
  id: number;
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
}
export interface CollectionItem {
  itemId: string;
  itemType: string;
  details?: CollectionItemDetail;
}
export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  isOwner: boolean;
  items: CollectionItem[];
}
import { type Campaign } from './campaign';

export interface Favourite {
  id: string | number;
  campaign: Campaign;
}
