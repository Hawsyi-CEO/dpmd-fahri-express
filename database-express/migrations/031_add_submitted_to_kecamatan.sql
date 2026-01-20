-- Add submitted_to_kecamatan column to bankeu_proposals table
ALTER TABLE bankeu_proposals 
ADD COLUMN submitted_to_kecamatan BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN submitted_at TIMESTAMP NULL AFTER submitted_to_kecamatan;

-- Add index for better query performance
CREATE INDEX idx_submitted_to_kecamatan ON bankeu_proposals(submitted_to_kecamatan);
