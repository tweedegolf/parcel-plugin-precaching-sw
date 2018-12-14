const { readFileSync, writeFileSync, unlinkSync, existsSync } = require('fs');
const path = require('path');

/**
 * Flatten the bundle structure to array of strings
 * @param bundle
 * @returns {*[]}
 */
const getAssets = (bundle, result = []) => {
  // console.log('BUNDLE NAME', bundle.name);
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
  // console.log('parcel options', bundler.options);
  const { outDir } = bundler.options;
  bundler.on('bundled', async (bundle) => {
    const pkg = await bundle.entryAsset.getPackage();
    const swConfig = pkg['serviceworker'];
    const swOutDir = swConfig.outDir || path.resolve(__dirname, '../');
    const fileName = swConfig.fileName || 'sw.js';
    const offlineUrl = swConfig.offlineUrl || './offline.html';
    const swPath = path.resolve(swOutDir, fileName);

    // console.log('service worker options', swConfig);
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

    assets.push(...swConfig.additional);
    assets.push(offlineUrl);
    const cache = JSON.stringify(assets);
    const cacheName = `${pkg.name}-${bundle.entryAsset.hash.substr(0, 8)}`;

    const template = readFileSync(path.resolve(
      __dirname,
      '../parcel-plugin-serviceworker/serviceworker.template.js'
    ), 'utf8');

    const sw = template
      .replace('\'%{caches}\'', cache)
      .replace('%{cacheName}', cacheName)
      .replace('%{offlineUrl}', offlineUrl)
      .replace(/"/g, '\'');

    writeFileSync(swPath, sw);
  });
};
