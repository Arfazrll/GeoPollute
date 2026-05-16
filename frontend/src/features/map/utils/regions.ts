export interface JakartaRegion {
  name: string;
  center: [number, number];
  zoom: number;
  type: string;
  isDefault?: boolean;
}
export const ALL_JAKARTA_REGIONS: JakartaRegion[] = [
  { name: 'DKI JAKARTA', center: [106.8456, -6.2088], zoom: 11, type: 'Province', isDefault: true },
  { name: 'JAKARTA PUSAT', center: [106.8456, -6.1864], zoom: 13, type: 'City', isDefault: true },
  { name: 'MENTENG', center: [106.8364, -6.1969], zoom: 14, type: 'District', isDefault: true },
  { name: 'JAKARTA SELATAN', center: [106.8000, -6.2615], zoom: 13, type: 'City' },
  { name: 'JAKARTA BARAT', center: [106.7500, -6.1683], zoom: 13, type: 'City' },
  { name: 'JAKARTA TIMUR', center: [106.8700, -6.2250], zoom: 13, type: 'City' },
  { name: 'JAKARTA UTARA', center: [106.8900, -6.1214], zoom: 13, type: 'City' },
  { name: 'TANAH ABANG', center: [106.8089, -6.1858], zoom: 14, type: 'District' },
  { name: 'SENAYAN', center: [106.8016, -6.2241], zoom: 15, type: 'District' },
  { name: 'KEMANG', center: [106.8150, -6.2730], zoom: 15, type: 'District' },
  { name: 'TEBET', center: [106.8444, -6.2300], zoom: 14, type: 'District' },
  { name: 'KUNINGAN', center: [106.8290, -6.2240], zoom: 15, type: 'District' },
  { name: 'GAMBIR', center: [106.8227, -6.1764], zoom: 14, type: 'District' },
  { name: 'GLODOK', center: [106.8140, -6.1435], zoom: 15, type: 'District' },
  { name: 'DUKUH ATAS', center: [106.8222, -6.2008], zoom: 15, type: 'Demo Area' },
  { name: 'BLOK M', center: [106.7975, -6.2433], zoom: 15, type: 'Demo Area' },
  { name: 'KEBAYORAN BARU', center: [106.7997, -6.2444], zoom: 14, type: 'District' },
  { name: 'KELAPA GADING', center: [106.9000, -6.1550], zoom: 14, type: 'District' },
  { name: 'CENGKARENG', center: [106.7200, -6.1500], zoom: 14, type: 'District' },
];