import { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

export enum ResourceType {
    Public = 'Public',
    Auth = 'Auth',
}

export default abstract class Interceptor {
    resource: string
    resourceType: ResourceType

    protected constructor(resource: string, resourceType: ResourceType) {
        this.resource = resource
        this.resourceType = resourceType
    }

    abstract requestFulfilled(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig

    abstract requestReject(error: any): any

    abstract responseFulfilled(response: AxiosResponse): any

    abstract responseReject(error: any): Promise<any>
}
