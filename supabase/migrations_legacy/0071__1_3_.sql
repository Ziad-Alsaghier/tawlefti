DROP TABLE IF EXISTS temp_full_blends;
DROP TABLE IF EXISTS temp_blend_compositions;
DROP TABLE IF EXISTS temp_name_mapping;

CREATE TABLE temp_full_blends (
  blend_code TEXT,
  coffee_name TEXT,
  percentage INTEGER,
  crema INTEGER,
  body INTEGER,
  acidity INTEGER,
  bitterness INTEGER,
  flavor INTEGER,
  notes TEXT,
  roast_profile TEXT
);

CREATE TABLE temp_name_mapping (
    file_name TEXT PRIMARY KEY,
    official_code TEXT NOT NULL
);

CREATE TABLE temp_blend_compositions (
  blend_code TEXT,
  coffee_type_id UUID,
  percentage INTEGER
);