-- ============================================================
-- SEED: 15 IoT sensor locations across Jakarta
-- ============================================================

INSERT INTO sensors (id, name, location_label, latitude, longitude) VALUES
  ('S-01', 'Menteng Station',      'Menteng',         -6.1751, 106.8650),
  ('S-02', 'Tanah Abang Station',  'Tanah Abang',     -6.2088, 106.8456),
  ('S-03', 'Setiabudi Station',    'Setiabudi',       -6.2297, 106.8395),
  ('S-04', 'Cikini Station',       'Cikini',          -6.1944, 106.8230),
  ('S-05', 'Grogol Station',       'Grogol',          -6.1614, 106.7732),
  ('S-06', 'Kebayoran Station',    'Kebayoran Baru',  -6.2615, 106.7811),
  ('S-07', 'Matraman Station',     'Matraman',        -6.2383, 106.9156),
  ('S-08', 'Sunter Station',       'Sunter',          -6.1382, 106.8336),
  ('S-09', 'Jatinegara Station',   'Jatinegara',      -6.1862, 106.8970),
  ('S-10', 'Kemang Station',       'Kemang',          -6.2615, 106.8106),
  ('S-11', 'Cilandak Station',     'Cilandak',        -6.3001, 106.8530),
  ('S-12', 'Kemayoran Station',    'Kemayoran',       -6.1495, 106.7849),
  ('S-13', 'Cawang Station',       'Cawang',          -6.2050, 106.9112),
  ('S-14', 'Pondok Indah Station', 'Pondok Indah',    -6.2700, 106.7800),
  ('S-15', 'Kebon Jeruk Station',  'Kebon Jeruk',     -6.1730, 106.8285)
ON CONFLICT (id) DO NOTHING;

-- Initialize sensor status
INSERT INTO sensor_status (sensor_id, online, battery_pct, firmware_version)
SELECT id, TRUE, 100, '1.0.0' FROM sensors
ON CONFLICT (sensor_id) DO NOTHING;