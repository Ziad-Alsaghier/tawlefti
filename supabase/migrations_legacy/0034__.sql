CREATE TABLE temp_turkish_blends (
    blend_code TEXT PRIMARY KEY,
    coffee_type_code TEXT,
    percentage INTEGER,
    sensory_profile JSONB
);