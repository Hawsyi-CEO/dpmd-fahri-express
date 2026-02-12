-- Fix submitted_to_kecamatan status for proposals that are revision/rejected
-- These should be set to FALSE so they can be re-submitted
UPDATE bankeu_proposals
SET submitted_to_kecamatan = FALSE,
    submitted_at = NULL
WHERE status IN ('revision', 'rejected') 
  AND submitted_to_kecamatan = TRUE;

-- Also ensure pending proposals that were never submitted are FALSE
UPDATE bankeu_proposals
SET submitted_to_kecamatan = FALSE,
    submitted_at = NULL
WHERE status = 'pending'
  AND submitted_to_kecamatan IS NULL;
