import { BuildRestClient } from 'azure-devops-extension-api/Build'

export type ArtifactBuildRestClient = Pick<BuildRestClient, 'getArtifacts' | 'getArtifactContentZip'>
