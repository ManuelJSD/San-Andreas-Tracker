import { LayerId } from './collectible.model';

export interface LayerMetadata {
  id: LayerId | string;
  name: string;
  icon: string; // FontAwesome class or emoji or image URL
  iconType: 'fa' | 'emoji' | 'img';
  color: string;
  description: string;
  isDefault: boolean;
  createCheckbox: boolean;
  createPopup: boolean;
  totalCount: number;
  category: 'collectibles' | 'activities' | 'utilities' | 'custom';
  tagColor?: string;
  rewardText?: string;
}

export interface LayerProgress {
  layerId: string;
  total: number;
  completed: number;
  percentage: number;
}
