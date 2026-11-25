import {config as overrideConfig} from './override';

export type AppConfig = {
  github: {
    token: string;
    repoOwner: string;
    repoName: string;
  };
};

const fallback: AppConfig = {
  github: {
    token: '',
    repoOwner: '',
    repoName: '',
  },
};

/**
 * Committed stub. Tokens stay empty unless Metro swaps in gitignored
 * `src/config/local.ts` (copied from `dev.example.ts`).
 */
export const config: AppConfig = {
  github: {
    ...fallback.github,
    ...overrideConfig.github,
  },
};
