import * as JSZip from 'jszip'
import { ArtifactBuildRestClient } from './ArtifactBuildRestClient'

interface FileEntry {
	name: string,
	contentsPromise: Promise<string>
}

export async function getArtifactsFileEntries(
	buildClient: ArtifactBuildRestClient,
	project: string,
	buildId: number,
	): Promise<FileEntry[]> {

	const artifacts = await buildClient.getArtifacts(project, buildId)
	const files = await (async () => {
		if (!artifacts.some(a => a.name === 'CodeAnalysisLogs')) return []
		const arrayBuffer = await buildClient.getArtifactContentZip(project, buildId, 'CodeAnalysisLogs')
		const zip = await JSZip.loadAsync(arrayBuffer)
		return Object.values(zip.files)
			.filter(entry => !entry.dir && entry.name.endsWith('.sarif'))
			.map(entry => ({
				name:            entry.name.replace('CodeAnalysisLogs/', ''),
				contentsPromise: entry.async('string')
			}))
	})()
	return files
}
