import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import 'script-loader!vss-web-extension-sdk/lib/VSS.SDK.min.js'
declare var VSS: any
// import {VSS} from './VSS.SDK.mock'

import { Viewer} from '@microsoft/sarif-web-component'
import { calcToolNamesSet } from './calcToolNamesSet'
import { Log } from 'sarif'

const perfLoadStart = performance.now() // For telemetry.

const appInsights = new ApplicationInsights({
	config: {
		connectionString: CONNECTION_STRING,
	},
})
appInsights.loadAppInsights()
addEventListener('unhandledrejection', e => appInsights.trackException({
	exception: e.reason
}))

@observer class Tab extends React.Component {
	static decoder = new TextDecoder() // @sinonjs/text-encoding polyfills IE.
	@observable.ref private logs = undefined as Log[]
	constructor(props) {
		super(props)
		VSS.init({
			applyTheme: true,
			explicitNotifyLoaded: true,
		})
		VSS.require(['TFS/WorkItemTracking/RestClient'], witModule => { // Tfs/WebPlatform/Client/TFS/WorkItemTracking/RestClient.ts
			const onLoaded = async ({id}) => {
				const witClient = witModule.getClient()
				const workItem = await witClient.getWorkItem(id, null, null, 1)
				const files = (workItem.relations || [])
					.filter(rr => rr.rel === 'AttachedFile' && rr.attributes.name.endsWith(".sarif"))
					.map((rr, i) => {
						let p = undefined
						return {
							key: i, text: rr.attributes.name,
							sarif: async () => p = p || Tab.decoder.decode(await witClient.getAttachmentContent(rr.url.substr(-36), rr.attributes.name))
						}
					})

				const logTexts = await Promise.all(files.map(async file => await file.sarif())) as string[]
				const logs = logTexts.map(log => JSON.parse(log) as Log)
				this.logs = logs

				appInsights.trackPageView({
					name: 'WorkItem',
					properties: {
						duration: performance.now() - perfLoadStart,
						results: logs.reduce((accum, log) => accum + log.runs.reduce((accum, run) => accum + run.results?.length ?? 0, 0), 0),
						logs: logs.length,
						toolNames: calcToolNamesSet(logs).values(),
						version: VSS.getExtensionContext().version,
					},
				})
			}
			VSS.register(VSS.getContribution().id, { onLoaded }) // ;onLoaded({ id: 1 })
			VSS.notifyLoadSucceeded() // Not working within onLoaded()
		})
	}
	render() {
		const {logs} = this
		return !logs || logs.length
			? <Viewer logs={logs} showSuppression
				filterState={{
					Baseline: { value: ['new', 'updated', 'unchanged'] }, // Not focusing on incremental changes, focusing on current state.
					Level: { value: ['error', 'warning'] },
					Suppression: { value: ['unsuppressed']},
				}} showActions={false} />
			: <div className="full">No SARIF attachments found.</div>
	}
}

ReactDOM.render(<Tab />, document.getElementById("app"))
