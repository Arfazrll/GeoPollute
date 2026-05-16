export interface Sensor {
  id: string;
  uuid: string;
  apiVersion: 'v1' | 'v2';
  latitude: number;
  longitude: number;
  active: boolean;
}

export const STATIC_SENSORS: Sensor[] = [
  { id: 'LCS-1', uuid: '44d5d408-17c1-49bd-bec3-eca943f78497', apiVersion: 'v2', latitude: -6.22932, longitude: 106.79982, active: true },
  { id: 'LCS-2', uuid: 'b17e88de-7927-495b-b669-a28c00d09cb2', apiVersion: 'v1', latitude: -6.245800, longitude: 106.875300, active: true },
  { id: 'LCS-3', uuid: '185e24d9-8ba9-4af9-bfe1-bcbd24c4b43a', apiVersion: 'v1', latitude: -6.211762, longitude: 106.763832, active: true },
  { id: 'LCS-4', uuid: 'd8f1b701-2802-4bcd-bb73-00105e7163d6', apiVersion: 'v1', latitude: -6.275300, longitude: 106.797700, active: true },
  { id: 'LCS-5', uuid: '74a42923-6332-46df-b0d0-6c0cfa1ceafb', apiVersion: 'v1', latitude: -6.134922, longitude: 106.812796, active: true },
  { id: 'LCS-6', uuid: '3fb757be-2045-4708-b61d-d1a5190f6d52', apiVersion: 'v1', latitude: -6.250400, longitude: 106.815230, active: true },
  { id: 'LCS-7', uuid: '6307d3bf-c752-48db-8449-2bf450a3c922', apiVersion: 'v1', latitude: -6.279579, longitude: 106.845108, active: true },
  { id: 'LCS-8', uuid: '44d82deb-08ce-4577-b7df-d8fc7e269bbc', apiVersion: 'v1', latitude: -6.154077, longitude: 106.706211, active: true },
  { id: 'LCS-9', uuid: '929016fc-487a-473b-b169-92159443edcc', apiVersion: 'v1', latitude: -6.192979, longitude: 106.910955, active: true },
  { id: 'LCS-10', uuid: '0e9af77d-17f5-4f99-aaa7-af5423c2d084', apiVersion: 'v1', latitude: -6.1538005, longitude: 106.9109397, active: true },
  { id: 'LCS-11', uuid: 'da7e8005-6ec3-42e1-a6cb-2f8f3ff4963b', apiVersion: 'v1', latitude: -6.20128, longitude: 106.82345, active: true },
  { id: 'LCS-12', uuid: '3b81261a-bd1c-4d65-91f3-211fb33f2c31', apiVersion: 'v2', latitude: -6.123810, longitude: 106.859667, active: true },
  { id: 'LCS-13', uuid: '893a37c8-7ffc-4acf-b0b2-4474e8eecccc', apiVersion: 'v1', latitude: -6.23583, longitude: 106.82596, active: true },
  { id: 'LCS-14', uuid: 'ff26ef11-1c71-4d8d-a519-e177a9280ee5', apiVersion: 'v1', latitude: -5.7468056, longitude: 106.6121966, active: true },
  { id: 'LCS-15', uuid: 'bf8cf23d-fb9a-4ba1-a108-db45cbdb397c', apiVersion: 'v1', latitude: -6.24596, longitude: 106.79821, active: true },
  { id: 'LCS-16', uuid: 'f86fe731-c5cd-406a-8709-2581b8bffc05', apiVersion: 'v1', latitude: -6.20955, longitude: 106.82196, active: true },
  { id: 'LCS-17', uuid: 'ae38fe54-454e-48e6-8f71-87fa5073d4cd', apiVersion: 'v2', latitude: -6.24048, longitude: 106.79855, active: true },
  { id: 'LCS-18', uuid: '245d3ee8-9109-4f4a-804c-4f561f63f8d1', apiVersion: 'v1', latitude: -6.20849, longitude: 106.82988, active: true },
  { id: 'LCS-19', uuid: '97c54eef-63a5-4801-b3b8-3d3f0a4e375e', apiVersion: 'v1', latitude: -6.21726, longitude: 106.81539, active: true },
  { id: 'LCS-20', uuid: 'c606236c-7570-48fc-ac2d-6e102f242058', apiVersion: 'v1', latitude: -6.1831, longitude: 106.82475, active: true },
  { id: 'LCS-21', uuid: '405b4d37-fd6a-4387-b3e8-8ae65c6b1341', apiVersion: 'v1', latitude: -6.24309, longitude: 106.80245, active: true },
  { id: 'LCS-23', uuid: '44f97b97-5ba9-4384-ab1e-6dfa53f450cb', apiVersion: 'v1', latitude: -6.18701, longitude: 106.82003, active: true },
  { id: 'LCS-24', uuid: '6a557710-80b1-4a76-9151-918e00816d97', apiVersion: 'v1', latitude: -6.20756, longitude: 106.79716, active: true },
  { id: 'LCS-26', uuid: '951a40ae-57d6-4389-a626-6b0ab5bb03b3', apiVersion: 'v1', latitude: -6.09637, longitude: 106.95996, active: true },
];
