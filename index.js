/* eslint-disable no-console */

const {
  readFileSync, writeFileSync, unlinkSync, existsSync,
} = require('fs');
const path = require('path');


const defaultConfig = {
  bypass: false,
  allowed: [
    'css',
    'js',
    'woff2',
    'svg',
    'ico',
    'png',
    'webmanifest',
  ],
  additional: [],
  offlineUrl: '/offline.html',
  fileName: 'sw.js',
  outDir: path.resolve(__dirname, '../'),
};


const getConfig = (pkg, bundleId) => {
  const conf = pkg.precachingSW || {};

  let {
    bypass = defaultConfig.bypass,
    allowed = defaultConfig.allowed,
    additional = defaultConfig.additional,
    outDir = defaultConfig.outDir,
    fileName = defaultConfig.fileName,
    offlineUrl = defaultConfig.offlineUrl,
  } = conf;

  const bundleConfig = conf[bundleId];
  if (bundleConfig) {
    ({
      bypass = bypass,
      allowed = allowed,
      additional = additional,
      outDir = outDir,
      fileName = fileName,
      offlineUrl = offlineUrl,
    } = bundleConfig);
  }

  return {
    bypass,
    allowed,
    additional,
    offlineUrl,
    path: path.resolve(outDir, fileName),
  };
};


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
        .map(a => getAssets(a, result)),
    );
    return result;
  }
  return result;
};


const createServiceWorker = async (bundle, outDir) => {
  const bundleId = bundle.entryAsset.id;
  const pkg = await bundle.entryAsset.getPackage();
  const config = getConfig(pkg, bundleId);
  // console.log('BUNDLE', bundle);
  // console.log('PKG', pkg);
  // console.log('ID', bundleId);
  // console.log('CONFIG', config);

  if (config.bypass === true) {
    if (existsSync(config.path)) {
      unlinkSync(config.path);
    }
    console.log(`Not generating a precaching serviceworker for "${bundleId}".`);
    return;
  }

  const assets = getAssets(bundle).filter((name) => {
    if (name.includes('/icon_')) {
      return false;
    }
    const ext = name.split('.').pop();
    return config.allowed.includes(ext);
  }).map(name => name.replace(outDir, '/assets'));

  if (config.additional && config.additional.length > 0) {
    assets.push(...config.additional);
  }
  assets.push(config.offlineUrl);
  const cache = JSON.stringify(assets);
  const cacheName = `${pkg.name}-${bundle.entryAsset.hash.substr(0, 8)}`;

  const template = readFileSync(path.resolve(
    __dirname,
    './precaching-sw.template.js',
  ), 'utf8');

  const sw = template
    .replace('%{created}', new Date())
    .replace('\'%{caches}\'', cache)
    .replace('%{cacheName}', cacheName)
    .replace('%{offlineUrl}', config.offlineUrl)
    .replace(/"/g, '\'');

  writeFileSync(config.path, sw);
};


module.exports = (bundler) => {
  const { outDir } = bundler.options;
  bundler.on('bundled', async (bundle) => {
    if (bundle.entryAsset === null && bundle.childBundles) {
      bundle.childBundles.forEach((b) => {
        createServiceWorker(b, outDir);
      });
    } else {
      createServiceWorker(bundle, outDir);
    }
  });
};
