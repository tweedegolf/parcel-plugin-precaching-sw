/* eslint-disable no-console */

const Parcel = require('parcel-bundler');
const clientConfig = {
  outDir: './dist',
  publicUrl: './',
  hmr: false,
  minify: false,
  sourceMaps: false,
  // hmrPort: 8888,
  watch: false,
  autoinstall: false,
  scopeHoist: false,
  cacheDir: '.cache',
};

const printSummary = (bundles) => {
  bundles.forEach(bundle => {
    console.log(`Build ${bundle.name} ${bundle.bundleTime}ms ${Math.ceil(
      bundle.totalSize / 1024,
    )}KB`);
  });
};

const build = async () => {
  const bundlerHtml = new Parcel('index.html', clientConfig);
  const b1 = await bundlerHtml.bundle();

  const bundlerJs = new Parcel('app.js', clientConfig);
  const b2 = await bundlerJs.bundle();

  printSummary([b1, b2]);
};

build();