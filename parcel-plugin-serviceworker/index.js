const { writeFileSync } = require('fs');
const path = require('path');

const getValue = function (obj, key) {
  return key.split('.').reduce(function (o, x) {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, obj);
};

const allowed = ['css', 'js', 'woff2', 'svg', 'ico', 'png', 'webmanifest'];


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
    const assets = getAssets(bundle).filter((name) => {
      if (name.includes('/icon_')) {
        return false;
      }

      const ext = name.split('.').pop();
      return allowed.includes(ext);
    }).map(name => name.replace(outDir, '/assets'));

    // assets.push('/offline.html');

    const cache = JSON.stringify(assets);
    const swConfig = pkg['serviceworker'];
    console.log('service worker options', swConfig);

    const p = path.resolve(swConfig.outDir, 'tgsw.js');
    writeFileSync(p, cache);
  });
};
