-- Check if banks exist in the database

-- Check all banks
SELECT * FROM banks ORDER BY name;

-- Count banks
SELECT COUNT(*) as total_banks FROM banks;

-- If no banks, insert Pakistani banks
-- Run the INSERT_PAKISTANI_BANKS.sql script from sql-scripts folder
