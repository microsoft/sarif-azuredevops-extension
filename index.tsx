import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import 'script-loader!vss-web-extension-sdk/lib/VSS.SDK.min.js'
import {Viewer} from 'sarif-web-component/components/Viewer'
declare var VSS: any

@observer class Tab extends React.Component<any, any> {
	static decoder = new TextDecoder("utf-8")

	@observable private loading = true
	@observable.ref private log = undefined

	constructor(props) {
		super(props)
		VSS.init({ explicitNotifyLoaded: true, usePlatformScripts: true })
		// Tfs/WebPlatform/Client/TFS/WorkItemTracking/RestClient.ts
		VSS.require(['TFS/WorkItemTracking/RestClient'], _WitRestClient => {
			const onLoaded = async ({id}) => {
				const witRestClient = _WitRestClient.getClient()
				const workItem = await witRestClient.getWorkItem(id, null, null, 1)				
				const files = (workItem.relations || [])
					.filter(rr => rr.rel === 'AttachedFile' && rr.attributes.name.endsWith(".sarif"))
					.map((rr, i) => {
						let p = undefined
						return {
							key: i, text: rr.attributes.name,
							sarif: async () => p = p || (async () =>
								Tab.decoder.decode(await witRestClient.getAttachmentContent(rr.url.substr(-36), rr.attributes.name))
							)()
						}
					})

				const first = files[0]
				if (first) {
					const foo = await first.sarif() as string
					this.log = JSON.parse(foo)
					console.log(this.log)
				}
				this.loading = false
			}
			VSS.register(VSS.getContribution().id, { onLoaded }) // ;onLoaded({ id: 1 })
			VSS.notifyLoadSucceeded()
		})
	}
	render() {
		const {loading, log} = this
		// const dd = <Dropdown className="resultsDropdown"
		// 	options={files} selectedKey={fileIndex}
		// 	onChange={(ev, option, i) => this.setState({ fileIndex: i })} />
		return loading || log
			? <Viewer log={log} />
			: <div className="full">No SARIF attachments found.</div>
	}
}

ReactDOM.render(<Tab />, document.getElementById("app"))
