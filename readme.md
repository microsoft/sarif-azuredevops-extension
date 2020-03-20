# SARIF SAST Scans Tab


### Development: Localhost
* In `index.tsx` switch to `VSS.SDK.mock.js`
* `npm start`
* go to: `https://localhost:8080` and bypass the chrome warning.


### Development: DevOps Dev
* `npm run publish-dev`
* go to: `https://dev.azure.com/jeffkingms/Project%20Zero/_workitems/edit/1/`


### Development: DevOps BaseUri
* `npm run publish-dev` with `baseUri`
* go to: `https://localhost:8080` and bypass the chrome warning.
* go to: `https://dev.azure.com/jeffkingms/Project%20Zero/_workitems/edit/1/`


### Deployment
```
npx webpack
tfx extension create --output-path: vsix --overrides-file vss-extension.prod.json
```

This creates a file inyour `./vsix` folder named `sariftools.scans-0.1.0.vsix` (version number will differ).

Upload the `vsix` file to `https://marketplace.visualstudio.com/manage/publishers/YOUR_PUBLISHER_ID`. On that page, find the matching extension, choose `⋯`, and choose `Update`.

Remember to commit any `vss-extension.json` `version` changes.