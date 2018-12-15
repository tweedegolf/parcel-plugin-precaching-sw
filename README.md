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
- `allowed` &rarr; Array of file extensions that will be added to the cache, defaults an array containing the following extensions:
  - css
  - js
  - woff2
  - svg
  - ico
  - png
  - webmanifest
- `additional` &rarr; Array containing additional files that must be added to the cache.
- `offlineUrl` &rarr; Url of the offline html file, this file will be added to the cache as well.
- `fileName` &rarr; The name of the file that holds the generated serviceworker, defaults to `sw.js`.
- `outDir` &rarr; The path to the directory where the serviceworker file will be saved to, defaults to `./`


