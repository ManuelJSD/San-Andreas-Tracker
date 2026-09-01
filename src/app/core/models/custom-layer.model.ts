export interface CustomLayerFeature {
  type: 'Feature';
  properties: {
    id: string;
    name?: string;
    description?: string;
    image_id?: string;
    video_id?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface CustomLayerData {
  id: string;
  name: string;
  geojson: {
    type: 'FeatureCollection';
    features: CustomLayerFeature[];
  };
  createdAt: number;
}
