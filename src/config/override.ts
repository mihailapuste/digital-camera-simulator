/**
 * Safe default checked into git. A developer machine can replace this module
 * at bundle time with gitignored `src/config/local.ts` (see metro.config.js).
 * Copy `dev.example.ts` to `local.ts` and fill in real values there.
 */
export const config = {
  github: {
    token: '',
    repoOwner: '',
    repoName: '',
  },
};
