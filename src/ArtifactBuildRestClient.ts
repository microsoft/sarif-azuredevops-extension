import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { Build, BuildArtifact } from 'azure-devops-extension-api/Build'
import { RestClientBase } from 'azure-devops-extension-api/Common/RestClientBase'

export type ArtifactBuildRestClient = Pick<BuildRestClient2, 'getArtifacts' | 'getArtifactContentZip'>

export class BuildRestClient2 extends RestClientBase {
    constructor(options: IVssRestClientOptions) {
        super(options);
    }
    
    /**
     * Gets a specific artifact for a build.
     * 
     * @param project - Project ID or project name
     * @param buildId - The ID of the build.
     * @param artifactName - The name of the artifact.
     */
    public async getArtifactContentZip(
        project: string,
        buildId: number,
        artifactName: string,
        apiVersion: string = "7.0"
        ): Promise<ArrayBuffer> {

        const queryValues: any = {
            artifactName: artifactName
        };

        return this.beginRequest<ArrayBuffer>({
            apiVersion: apiVersion,
            httpResponseType: "application/zip",
            routeTemplate: "{project}/_apis/build/builds/{buildId}/artifacts/{artifactName}",
            routeValues: {
                project: project,
                buildId: buildId
            },
            queryParams: queryValues
        });
    }
    
    /**
     * Gets all artifacts for a build.
     * 
     * @param project - Project ID or project name
     * @param buildId - The ID of the build.
     */
    public async getArtifacts(
        project: string,
        buildId: number,
        apiVersion: string = "7.0"
        ): Promise<BuildArtifact[]> {

        return this.beginRequest<BuildArtifact[]>({
            apiVersion: apiVersion,
            routeTemplate: "{project}/_apis/build/builds/{buildId}/artifacts/{artifactName}",
            routeValues: {
                project: project,
                buildId: buildId
            }
        });
    }
    
    /**
     * Gets a build
     * 
     * @param project - Project ID or project name
     * @param buildId - 
     * @param propertyFilters - 
     */
    public async getBuild(
        project: string,
        buildId: number,
        propertyFilters?: string,
        apiVersion: string = "7.0"
        ): Promise<Build> {

        const queryValues: any = {
            propertyFilters: propertyFilters
        };

        return this.beginRequest<Build>({
            apiVersion: apiVersion,
            routeTemplate: "{project}/_apis/build/builds/{buildId}",
            routeValues: {
                project: project,
                buildId: buildId
            },
            queryParams: queryValues
        });
    }
}