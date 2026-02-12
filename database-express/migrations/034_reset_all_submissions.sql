-- Reset all submission flags to ensure clean state
-- This migration ensures no proposals are auto-submitted

-- Reset all proposals to not submitted state
UPDATE bankeu_proposals
SET submitted_to_kecamatan = FALSE,
    submitted_at = NULL,
    submitted_to_dpmd = FALSE,
    submitted_to_dpmd_at = NULL
WHERE 1=1;

-- Only keep verified proposals as submitted to kecamatan
UPDATE bankeu_proposals
SET submitted_to_kecamatan = TRUE
WHERE status = 'verified';
