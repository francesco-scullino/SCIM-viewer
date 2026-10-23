const esbuild = require('esbuild');
esbuild.buildSync({ entryPoints: ['.impeccable/smoke-entry.tsx'], absWorkingDir: __dirname + '/..', bundle: true, platform: 'node', format: 'cjs', outfile: __dirname + '/smoke.cjs' });
require('./smoke.cjs');
