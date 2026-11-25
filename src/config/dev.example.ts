/**
 * Copy this file to `src/config/local.ts` (gitignored) to point Toadly at a
 * private GitHub repo. Leave the values empty in git. The app boots either way;
 * the reporter stays off until a token, owner, and repo are all set.
 *
 * Metro loads `local.ts` instead of `override.ts` when the file exists.
 */
export const config = {
  github: {
    token: '',
    repoOwner: '',
    repoName: '',
  },
};
