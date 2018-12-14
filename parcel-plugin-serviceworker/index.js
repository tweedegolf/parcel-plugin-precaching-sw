const { writeFileSync, unlinkSync, existsSync } = require('fs');
const path = require('path');

const getValue = function (obj, key) {
  return key.split('.').reduce(function (o, x) {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, obj);
};



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
    const dir = swConfig.outDir || path.resolve(__dirname, '../');
    const file = swConfig.fileName || 'sw.js';
    const swPath = path.resolve(dir, file);

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
    const cache = JSON.stringify(assets);
    writeFileSync(swPath, cache);
  });
};
