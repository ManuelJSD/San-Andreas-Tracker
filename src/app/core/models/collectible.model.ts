export type LayerId =
  | 'tags'
  | 'snapshots'
  | 'horseshoes'
  | 'oysters'
  | 'stunt_jumps'
  | 'cop_bribes'
  | 'race_tournaments'
  | 'busted_warps'
  | 'death_warps'
  | 'airports';

export interface CollectibleFeatureProperties {
  id: string;
  name?: string;
  description?: string;
  image_id?: string;
  image_link?: string;
  video_id?: string;
  radius?: number;
  [key: string]: any;
}

export interface CollectibleFeature {
  type: 'Feature';
  properties: CollectibleFeatureProperties;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: any;
  };
  _layerId?: LayerId | string;
  _origin?: number;
}

export interface CollectibleFeatureCollection {
  type: 'FeatureCollection';
  features: CollectibleFeature[];
}

export interface CollectibleItem {
  id: string;
  layerId: LayerId | string;
  title: string;
  description?: string;
  imageId?: string;
  imageLink?: string;
  videoId?: string;
  completed: boolean;
  coordinates?: [number, number];
}
