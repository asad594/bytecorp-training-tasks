import * as migration_20260906_114421 from './20260906_114421';

export const migrations = [
  {
    up: migration_20260906_114421.up,
    down: migration_20260906_114421.down,
    name: '20260906_114421'
  },
];
