import { Log } from 'sarif'

export function calcToolNamesSet(logs: Log[]) {
	const toolNames = logs.map(log => {
		return log.runs
			.filter(run => run.tool.driver) // Guard against old versions.
			.map(run => run.tool.driver.name)
	})
	return new Set([].concat(...toolNames))
}
