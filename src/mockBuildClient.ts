import { BuildArtifact } from 'azure-devops-extension-api/Build'
import * as JSZip from 'jszip'
import { ArtifactBuildRestClient } from './ArtifactBuildRestClient'

interface MockBuildArtifact {
	name: string
	zipBuffer: Uint8Array
}

// Verified to match an actual artifact zip downloaded from Azure DevOps.
async function generateMockBuildArtifact(name: string, fileName: string): Promise<MockBuildArtifact> {
	const zip = new JSZip()
	zip.folder(name)
		.file(fileName, `{ ${fileName} }`)
	return {
		name,
		zipBuffer: await zip.generateAsync({type: 'uint8array'})
	}
}

let mockBuildArtifacts: MockBuildArtifact[]
async function generateMockBuildArtifacts() {
	if (!mockBuildArtifacts) {
		mockBuildArtifacts = [
			// SARIF log names don't neccesarily need to match the Artifact name.
			await generateMockBuildArtifact('CodeAnalysisLogs',     'CodeAnalysisLogs.sarif'),
			await generateMockBuildArtifact('foo_sdl_analysis',     'foo_sdl_analysis.sarif'),
			await generateMockBuildArtifact('foo_sdl_analysis_bar', 'foo_sdl_analysis_bar.sarif'),
			await generateMockBuildArtifact('foo_sdl_sources',      'foo_sdl_sources.sarif'),
			await generateMockBuildArtifact('foo_sdl_sources_bar',  'foo_sdl_sources_bar.sarif'),
			await generateMockBuildArtifact('nonSarifArtifact',     'nonSarifArtifact.sarif'),
		] 
	}
	return mockBuildArtifacts
}

export const buildClient: ArtifactBuildRestClient = {
	async getArtifacts(_project: string, _buildId: number): Promise<BuildArtifact[]> {
		const artifacts = await generateMockBuildArtifacts()
		return artifacts.map(a => ({ name: a.name })) as unknown as BuildArtifact[]
	}
}

export async function getArtifactContentZip(url: string): Promise<ArrayBuffer> {
		const artifactName = url.split('/').pop()!
		const artifacts = await generateMockBuildArtifacts()
		return artifacts.find(a => a.name === artifactName)!.zipBuffer // Uint8Array is a subclass of ArrayBuffer
	}