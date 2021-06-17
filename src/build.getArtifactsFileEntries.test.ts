import { getArtifactsFileEntries } from './build.getArtifactsFileEntries'
import { buildClient } from './mockBuildClient'

test('Artifacts are filtered correctly by name.', async () => {
	const files = await getArtifactsFileEntries(buildClient, '', 0)
	const logTexts = await Promise.all(files.map(async file => await file.contentsPromise))
	expect(logTexts).toHaveLength(2)
})
