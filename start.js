const Bundler = require('parcel-bundler');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// you may be messing quite a bit in a new plugin so you may want to add error capture
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// manually set up the bundler
const bundler = new Bundler('./index.html');
console.log(bundler);

// bundler.addPackager('ext', require.resolve('./MyPackager'));
// bundler.addAssetType('ext', require.resolve('./MyAsset'));

// bundler.serve(1234, false);