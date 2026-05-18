import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from 'dotenv';

process.env.NODE_ENV ??= 'test';

const envTestPath = resolve(__dirname, '..', '.env.test');

if (existsSync(envTestPath)) {
  config({
    path: envTestPath,
    override: false,
  });
}
