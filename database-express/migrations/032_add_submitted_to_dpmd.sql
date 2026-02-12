-- Add submitted_to_dpmd column to bankeu_proposals table
ALTER TABLE bankeu_proposals 
ADD COLUMN submitted_to_dpmd BOOLEAN DEFAULT FALSE AFTER submitted_at,
ADD COLUMN submitted_to_dpmd_at TIMESTAMP NULL DEFAULT NULL AFTER submitted_to_dpmd;

-- Create index for better query performance
CREATE INDEX idx_submitted_to_dpmd ON bankeu_proposals(submitted_to_dpmd);
