import axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { parseFormData } from 'shared/helpers/function'
import AuthenticationInterceptor from './interceptor/AuthenticationInterceptor'
import DefaultInterceptor from './interceptor/DefaultAppInterceptor'
import { ResourceType } from './interceptor/Interceptor'
import { RetryInterceptor } from './interceptor/RetryInterceptor'
import { baseUrl } from './resource'

export type HTTPMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' | 'POSTFORM'

interface IConstructor {
    method: HTTPMethod
    resource: string
    resourceType: ResourceType
    isFormDataType?: boolean
    body?: any
    params?: any
    onSendProgress?: (progress: number, total: number) => void
    onReceivedProgress?: (progress: number, total: number) => void
    queryParams?: any
}
class ApiGateway {
    // resource = ''
    // method: HTTPMethod = 'GET'
    // resourceType: ResourceType = ResourceType.Auth
    // isFormDataType?: boolean
    // body?: any
    // params?: any
    // queryParams?: any
    _instanceAxios = axios.create()
    configTimeout = 60 * 1000
    requestConfig!: AxiosRequestConfig

    constructor(data?: IConstructor) {
        // const { isFormDataType, resource, resourceType, method, body, params, queryParams,
        //     onReceivedProgress, onSendProgress, } = data ?? {}
        // this.resourceType = resourceType ?? ResourceType.Public
        // this.resource = resource ?? ''
        // this.method = method ?? 'GET'
        // if (method != 'GET') this.body = body
        // this.params = params
        // this.onSendProgress = onSendProgress
        // this.onReceivedProgress = onReceivedProgress
        // this.isFormDataType = isFormDataType
        // const queryString = qs.stringify(queryParams, { skipNulls: true })
        // this.queryParams = queryString ? `?${queryString}` : ''
    }

    setConfig = (config: IConstructor) => {
        const { method, resource, resourceType, body, isFormDataType, params, queryParams, onReceivedProgress, onSendProgress } = config
        const configHeader = {
            'Accept': 'application/json',
            'Content-Type': isFormDataType ? 'multipart/form-data' : 'application/json', // Content-Type = 'application/json' == null
        }
        const urlRequest = queryParams ? resource + queryParams : resource
        let bodyRequest = body
        if (isFormDataType) bodyRequest = parseFormData(body)
        if (method == 'GET') bodyRequest = undefined

        this.requestConfig = {
            baseURL: baseUrl.value,
            timeout: this.configTimeout,
            headers: configHeader,
            url: urlRequest,
            method: method,
            params: params,
            paramsSerializer: {
                encode: (params: any) => qs.stringify(params, {
                    skipNulls: true,
                    arrayFormat: 'brackets'
                })
            },
            data: bodyRequest
        };
        if (onSendProgress != null) {
            this.requestConfig.onUploadProgress = ({ loaded, total }) => onSendProgress!(loaded, total ?? 0)
        }
        if (onReceivedProgress != null) {
            this.requestConfig.onDownloadProgress = ({ loaded, total }) => onReceivedProgress!(loaded, total ?? 0)
        }
        this._addDefaultInterceptors(resource, resourceType)
        this._addInterceptors(resource, resourceType)
    };

    private readonly _addDefaultInterceptors = (resource: string, resourceType: ResourceType) => {
        const authenticationInterceptor = new AuthenticationInterceptor(resource, resourceType)
        this._instanceAxios.interceptors.request.use(authenticationInterceptor.requestFulfilled)

        const defaultInterceptor = new DefaultInterceptor(resource, resourceType)
        this._instanceAxios.interceptors.request.use(
            defaultInterceptor.requestFulfilled,
            defaultInterceptor.requestReject
        );
        this._instanceAxios.interceptors.response.use(
            defaultInterceptor.responseFulfilled,
            defaultInterceptor.responseReject
        );

        const retryInterceptor = new RetryInterceptor(this._instanceAxios, resource, resourceType)
        this._instanceAxios.interceptors.response.use(
            retryInterceptor.responseFulfilled,
            retryInterceptor.responseReject
        );
    }

    private readonly _addInterceptors = (resource: string, resourceType: ResourceType) => {
        // some expand interceptors default can be add here!
    }

    execute = async (): Promise<any> => await this._instanceAxios.request(this.requestConfig)
}

export default new ApiGateway()
