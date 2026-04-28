export type CategoryId = 'oneday' | 'twoweek' | 'color' | 'toric' | 'multifocal';

export interface ProductSpec {
  bc: string;
  dia: string;
  power: string;
  water: string;
  material?: string;
  thickness?: string;
  uv: boolean;
  replacementCycle: string;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  image: string;
  price: number;
  boxCount: number;
  rating: number;
  reviewCount: number;
  rakutenUrl: string;
  description: string;
  features: string[];
  targetUsers: string[];
  specs: ProductSpec;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}
