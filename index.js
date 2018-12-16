const { readFileSync, writeFileSync, unlinkSync, existsSync } = require('fs');
const path = require('path');

/**
 * Flatten the bundle structure to array of strings
 * @param bundle
 * @returns {*[]}
 */
const getAssets = (bundle, result = []) => {
  result.push(bundle.name);
  if (bundle.entryAsset) {
    result.concat(
      ...Array.from(bundle.entryAsset.parentBundle.childBundles)
        .map(a => {
          getAssets(a, result);
        })
    );
    return result;
  }
};

module.exports = bundler => {
  const { outDir } = bundler.options;
  bundler.on('bundled', async (bundle) => {
    // console.log('BUNDLE', bundle);
    let pkg;
    try {
      pkg = await bundle.entryAsset.getPackage();
    } catch (e) {
      console.error('ERROR', e);
      return;
    }
    // console.log('ID', bundle.entryAsset.id);
    // console.log('PKG', pkg);
    let swConfig = pkg['precachingSW'];
    const bundleConfig = swConfig[bundle.entryAsset.id];
    if (bundleConfig) {
      swConfig = bundleConfig;
    }
    const swOutDir = swConfig.outDir || path.resolve(__dirname, '../');
    const fileName = swConfig.fileName || 'sw.js';
    const offlineUrl = swConfig.offlineUrl || './offline.html';
    const swPath = path.resolve(swOutDir, fileName);
    // console.log('CONFIG', swConfig);

    if (swConfig.bypass === true) {
      if (existsSync(swPath)) {
        unlinkSync(swPath);
      }
      return;
    }

    const allowed = swConfig.allowed || [
      'css',
      'js',
      'woff2',
      'svg',
      'ico',
      'png',
      'webmanifest'
    ];
    const assets = getAssets(bundle).filter((name) => {
      if (name.includes('/icon_')) {
        return false;
      }
      const ext = name.split('.').pop();
      return allowed.includes(ext);
    }).map(name => name.replace(outDir, '/assets'));

    if (swConfig.additional && swConfig.additional.length > 0) {
      assets.push(...swConfig.additional);
    }
    assets.push(offlineUrl);
    const cache = JSON.stringify(assets);
    const cacheName = `${pkg.name}-${bundle.entryAsset.hash.substr(0, 8)}`;

    const template = readFileSync(path.resolve(
      __dirname,
      './precaching-sw.template.js'
    ), 'utf8');

    const sw = template
      .replace('%{created}', new Date())
      .replace('\'%{caches}\'', cache)
      .replace('%{cacheName}', cacheName)
      .replace('%{offlineUrl}', offlineUrl)
      .replace(/"/g, '\'');

    writeFileSync(swPath, sw);
  });
};
