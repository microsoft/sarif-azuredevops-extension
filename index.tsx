import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import 'script-loader!vss-web-extension-sdk/lib/VSS.SDK.min.js'
declare var VSS: any
// import {VSS} from './VSS.SDK.mock'

import {Log, Viewer} from '@microsoft/sarif-web-component'

@observer class Tab extends React.Component<any, any> {
	static decoder = new TextDecoder()
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
					Baseline: { value: ['new', 'unchanged', 'updated'] },
					Suppression: { value: ['unsuppressed']},
				}} />
			: <div className="full">No SARIF attachments found.</div>
	}
}

ReactDOM.render(<Tab />, document.getElementById("app"))
