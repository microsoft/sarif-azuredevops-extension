import { AppInsights } from "applicationinsights-js"
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
			const webContext = VSS.getWebContext()
			console.info('Version', VSS.getExtensionContext().version, INSTRUMENTATION_KEY)
			AppInsights.setAuthenticatedUserContext(
				webContext.user.uniqueName, // email
				webContext.account.name, // organization
			)

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

				AppInsights.trackPageView(
					webContext.project.name,
					document.referrer, // sometimes full url, sometimes just the host
					{ // customDimensions
						page: 'workItem',
						logLength: logs.length + '',
						toolNames: [...calcToolNamesSet(logs).values()].join(' '),
						version: VSS.getExtensionContext().version,
					},
					undefined,
					performance.now() - perfLoadStart
				)
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
				}} />
			: <div className="full">No SARIF attachments found.</div>
	}
}

AppInsights.downloadAndSetup({ instrumentationKey: INSTRUMENTATION_KEY })
addEventListener('unhandledrejection', e => AppInsights.trackException(e.reason))
ReactDOM.render(<Tab />, document.getElementById("app"))
