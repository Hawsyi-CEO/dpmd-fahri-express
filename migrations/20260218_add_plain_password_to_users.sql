-- Add plain_password column to users table for admin troubleshooting
-- Only used by SPKED admin to view passwords for dinas/verifikator accounts
ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) NULL AFTER password;
