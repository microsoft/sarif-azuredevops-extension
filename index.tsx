import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'script-loader!vss-web-extension-sdk/lib/VSS.SDK.min.js'
import {ResultsViewer, Dropdown} from 'sarif-web-component/Index.tsx'

declare var VSS: any

VSS.init()

const sarif = {
	"$schema": "http://json.schemastore.org/sarif-2.0.0",
	"version": "2.0.0",
	"runs": [{
		"tool": { "name": "BinSkim" },
		"results": [
			{
				"ruleId": "BA3001",
				"level": "notApplicable",
				"message": {
					"arguments": [
						"MixedMode_x86_VS2015_Default.exe",
						"EnablePositionIndependentExecutable",
						"image is not an ELF binary"
					]
				},
				"ruleMessageId": "NotApplicable_InvalidMetadata",
				"locations": [{
					"physicalLocation": {
						"fileLocation": {
							"uri": "file:///Z:/src/Test.FunctionalTests.BinSkim.Driver/BaselineTestsData/MixedMode_x86_VS2015_Default.exe"
						}
					}
				}]
			},
		],
	}]
}

const defaultFile = { filename: 'Default', json: sarif }
class Tab extends React.Component<any, any> {
	state = {
		files: [defaultFile],
		fileIndex: 0,
	}
	constructor(props) {
		super(props)
		VSS.ready(() => {
			const config = VSS.getConfiguration()
			config.onBuildChanged(build => {
				VSS.require(
					['TFS/Build/RestClient'],
					async restClient => {
						const client = restClient.getClient()
						client.getArtifactContentZip(build.id, 'CodeAnalysisLogs').then(artifacts => {
							const blob = new Blob([new Uint8Array(artifacts)])
							zip.createReader(new zip.BlobReader(blob),
								reader => {
									reader.getEntries(entries => {
										this.setState({ files: [defaultFile, ...entries.filter(entry => entry.filename.endsWith('.sarif'))] })
										// reader.close(() => {})
									})
								},
								error => { debugger }
							)
						})
					}
				)
			})
		})
	}
	render() {
		const {files, fileIndex} = this.state
		
		// const dd = <select value={fileIndex} onChange={async e => {
		// 		const i = e.target.value
		// 		const file = files[i]
		// 		file.json = file.json || await new Promise(resolve => {
		// 			file.getData(
		// 				new zip.TextWriter(),
		// 				text => resolve(text),
		// 				(current, total) => console.log(current, total)
		// 			)
		// 		})
		// 		this.setState({ fileIndex: i })
		// 	}}
		// 	style={{ margin: 15, marginBottom: 0 }}>
		// 	{files.map((f, i) => <option key={i} value={i}>{f.filename.replace('CodeAnalysisLogs/', '')}</option>)}
		// </select>
		
		const dd = <Dropdown className="resultsDropdown"
			options={files.map((f, i) => ({ key: i, text: f.filename.replace('CodeAnalysisLogs/', '') }))}
			selectedKey={fileIndex}
			onChanged={async option => {
					const i = option.key
					const file = files[i]
					file.json = file.json || await new Promise(resolve => {
						file.getData(
							new zip.TextWriter(),
							text => resolve(text),
							(current, total) => {}
						)
					})
					this.setState({ fileIndex: i })
				}} />
		
		return <ResultsViewer sarif={files[fileIndex].json} prefix={dd} />
	}
}

ReactDOM.render(<Tab />, document.getElementById("app"))
