DROP TABLE IF EXISTS temp_new_coffee_types;
CREATE TABLE temp_new_coffee_types (coffee_name TEXT PRIMARY KEY);
INSERT INTO temp_new_coffee_types (coffee_name)
SELECT DISTINCT coffee_name FROM temp_full_blends
WHERE coffee_name NOT IN (SELECT name_ar FROM coffee_types);