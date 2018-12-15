# Parcel plugin that creates a precaching serviceworker

The plugin is configurable by adding a `precachingSW` entry to your package.json file.

```json
  "precachingSW": {
    "bypass": false,
    "allowed": [
      "js",
      "css",
      "map",
      "html"
    ],
    "additional": [],
    "offlineUrl": "/offline.html",
    "fileName": "sw.js",
    "outDir": "./"
  },
```

- `bypass` &rarr; When set to `true` no serviceworker is created. Defaults to `false`.
- `allowed` &rarr; Array of file extensions that will be added to the cache. Defaults an array containing the following extensions:
  - css
  - js
  - woff2
  - svg
  - ico
  - png
  - webmanifest
- `additional` &rarr; Array containing additional files that must be added to the cache.
- `offlineUrl` &rarr; Url of the offline html file, this file will be added to the cache as well.
- `fileName` &rarr; The name of the file that holds the generated serviceworker. Defaults to `sw.js`.
- `outDir` &rarr; The path to the directory where the serviceworker file will be saved to. Defaults to `./`.


## Example

In the example folder you'll find a very basic example of how to use and configure this plugin. To run the example `cd` into the example folder and run `npm i`. After all depedencies are installed run `npm run start`. Now parcels bundles the example app and after bundling it generates a serviceworker file. Then the app starts at localhost:1234.

In the package.json file you see that the plugin is added to the `devDependencies`. I am using `file:..` here so the local version of the plugin will be installed; this is handy if you want to tinker a bit with the plugin code. In your real-life project it will look something like `^0.0.1`.

Also in the package.json file you see the `precachingSW` entry; just play around with the parameters to get a grip on how they work.

The example project itself, and thus the project for which the plugin generates a precaching serverworker is fairly simple: it contains an index.html that embeds a stylesheet (app.css) and a javascript file (app.js). In the stylesheet a background image is applied to the body; because the jpeg extension is in the `allowed` array, you can see in the generated serviceworker file that the background image gets cached as well.