import * as JSZip from 'jszip'
import { ArtifactBuildRestClient } from './ArtifactBuildRestClient'

interface FileEntry {
	name: string,
	artifactName: string,
	filePath: string,
	buildId: number,
	contentsPromise: Promise<string>
}

export async function getArtifactsFileEntries(
	buildClient: ArtifactBuildRestClient,
	project: string,
	buildId: number,
	): Promise<FileEntry[]> {

	const artifacts = await buildClient.getArtifacts(project, buildId)
	const files = await Promise.all(
		artifacts
			.filter(artifact => {
				return artifact.name === 'CodeAnalysisLogs'
					|| artifact.name.includes('_sdl_analysis') // OneBranch
					|| artifact.name.endsWith('_sdl_sources')  // OneBranch
			})
			.map(async artifact => {
				const arrayBuffer = await buildClient.getArtifactContentZip(project, buildId, artifact.name)
				const zip = await JSZip.loadAsync(arrayBuffer)
				return Object
				    .values(zip.files)
					.filter(entry => !entry.dir && entry.name.endsWith('.sarif'))
					.map(entry => ({
						name:            entry.name.replace(`${artifact.name}/`, ''),
						artifactName:    artifact.name,
						filePath:        entry.name.replace(`${artifact.name}/`, '') + artifact.name,
						buildId:         buildId,
						contentsPromise: entry.async('string')
					}))
			})
	)
	return files.flat()
}
