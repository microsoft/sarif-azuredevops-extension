import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'script-loader!vss-web-extension-sdk/lib/VSS.SDK.min.js'
import {ResultsViewer, Dropdown} from 'sarif-web-component/Index.tsx'

declare var VSS: any
class Tab extends React.Component<any, any> {
	static decoder = new TextDecoder("utf-8")
	state = { files: undefined, fileIndex: 0 }
	constructor(props) {
		super(props)
		VSS.init({ explicitNotifyLoaded: true, usePlatformScripts: true })
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
				this.setState({ files })
			}
			VSS.register(VSS.getContribution().id, { onLoaded }) // ;onLoaded({ id: 1 })
			VSS.notifyLoadSucceeded()
		})
	}
	render() {
		const {files, fileIndex} = this.state
		const dd = <Dropdown className="resultsDropdown"
			options={files} selectedKey={fileIndex}
			onChange={(ev, option, i) => this.setState({ fileIndex: i })} />
		return !files || files.length
			? <ResultsViewer sarif={files && files[fileIndex].sarif()} prefix={dd} />
			: <div className="full">No SARIF attachments found.</div>
	}
}

ReactDOM.render(<Tab />, document.getElementById("app"))
