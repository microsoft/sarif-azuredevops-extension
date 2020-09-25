# SARIF SAST Scans Tab

See `vss-extension.md` for public facing info. This is for contributors/developers.

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

### New API
import('azure-devops-extension-sdk').init() results in "No handler found on any channel for message"
and "Error: Cannot get registered instance for : JeffKingO.scans-dev.workitem-tab"

```
import * as SDK from 'azure-devops-extension-sdk'
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking'

SDK.init({
	applyTheme: true,
	loaded: true,
})
;(async () => {
	await SDK.ready()
	console.info('Version', SDK.getExtensionContext().version)

	const workItem = await SDK.getService<IWorkItemFormService>(WorkItemTrackingServiceIds.WorkItemFormService)
	const relations = await workItem.getWorkItemRelations()
	console.log(relations)
})()
```