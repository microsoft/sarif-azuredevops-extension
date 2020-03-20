const demoLog = {
	version: "2.1.0",
	runs: [{
		tool: { driver: {
			name: "Example Tool" },
		},
		results: [
			{
				ruleId: 'Example Rule',
				level: 'error',
				locations: [{
					physicalLocation: { artifactLocation: { uri: 'example.txt' } },
				}],
				message: { text: 'Welcome to the online SARIF Viewer demo. Drag and drop a SARIF file here to view.' },
				baselineState: 'new',
			},
		],
	}]
} 

const encoder = new TextEncoder()

export const VSS = {
	getContribution: () => ({ id: '' }),
	init: _options => {},
	require: (_modules, callback) => {
		const workItem = {
			relations: [
				{
					rel: 'AttachedFile',
					attributes: { name: 'sample.sarif' },
					url: '',
				},
			],
		}
		const witClient = {
			getWorkItem: (_id, _a, _b, _i) => workItem,
			getAttachmentContent: async (_url, _name) => encoder.encode(JSON.stringify(demoLog))
		}
		const witModule = {
			getClient: () => witClient,
		}
		callback(witModule)
	},
	register: (_id, options) => {
		options.onLoaded({ id: 1 })
	},
	notifyLoadSucceeded: () => {},
}
