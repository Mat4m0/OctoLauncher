const { spawnSync } = require('node:child_process');

if (process.platform !== 'win32') {
	console.log('postinstall: skipping Windows-only native addon rebuild');
	process.exit(0);
}

const builder = require.resolve('electron-builder/cli.js');
const rebuild = spawnSync(process.execPath, [builder, 'install-app-deps'], {
	stdio: 'inherit'
});
if (rebuild.status !== 0) process.exit(rebuild.status ?? 1);

require('./scrub-native-paths.cjs');
