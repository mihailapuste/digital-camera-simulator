import {config} from '../src/config';
import {SetupToadly, showToadlyReportDialog} from '../src/services/ToadlyService';

test('ships without a GitHub token and does not throw at boot', () => {
  expect(config.github.token).toBe('');
  expect(config.github.repoOwner).toBe('');
  expect(config.github.repoName).toBe('');
  expect(() => SetupToadly()).not.toThrow();
  expect(() => showToadlyReportDialog()).not.toThrow();
});
