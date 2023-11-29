import { SessionStorage } from 'app/App';
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import qs from 'qs'
import Interceptor, { ResourceType } from './Interceptor'

export default class AuthenticationInterceptor extends Interceptor {
    constructor(resource: string, resourceType: ResourceType) {
        super(resource, resourceType)
    }

    getTokenFromType = (type: ResourceType): string => {
        const userData = SessionStorage
        switch (type) {
            case ResourceType.Auth:
                return userData?.token ?? ''
            case ResourceType.Public:
            default:
                return ''
        }
    };

    /**
     * @param {InternalAxiosRequestConfig} config
     * @param {IResource} resourceType
     * @return {InternalAxiosRequestConfig}
     */
    requestFulfilled = (config: InternalAxiosRequestConfig) => {
        const token = this.getTokenFromType(this.resourceType)

        // with axios from ^1.6 dont need this fallback
        // if (config.headers == null) {
        //     config.headers = {}
        // }

        const contentType = config.headers['Content-Type']
        if (contentType === 'application/x-www-form-urlencoded') {
            config.data = qs.stringify(config.data)
        }

        if (!!token) {
            config.headers.Authorization = token
        }

        if (this.resourceType) {
            // Add default token of axios for unit test
            // config.headers.Authorization = axios.defaults.headers['Authorization'];
        }
        return config
    };

    requestReject = async (error: any) => {
        return await Promise.reject(error)
    };

    responseFulfilled = (response: AxiosResponse) => response

    responseReject = async (error: AxiosError) => await Promise.reject(error)
}
