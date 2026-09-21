// Produces a stable, illustrative 9-digit "routing number" from a seed
// (typically a branch code). This is NOT a real ABA routing number - it's
// a cosmetic detail for the account details view, deterministic so the
// same branch always shows the same value.
export function fakeRoutingNumber(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const digits = String(hash).padStart(9, "0").slice(0, 9);
  return digits;
}
