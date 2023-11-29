import { ResponseModel } from 'app/models/common'
import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { emitShowToast } from 'shared/helpers/function'
import { UserRepository } from 'app/data/repositories/user'
import { urls } from '../resource'
import Interceptor, { ResourceType } from './Interceptor'
import { getString } from 'shared/localization'

type RefreshTokenCallback = (token: string, refreshToken?: string) => void

let isRefreshing = false
let isForceLogout = false
let refreshSubscribers: RefreshTokenCallback[] = []

export class RetryInterceptor extends Interceptor {
    axiosInstance: AxiosInstance
    _userRepository: typeof UserRepository

    constructor(axiosInstance: AxiosInstance, resource: string, resourceType: ResourceType) {
        super(resource, resourceType)
        this.axiosInstance = axiosInstance
        this._userRepository = UserRepository
    }

    requestFulfilled = (config: InternalAxiosRequestConfig) => {
        return config
    };

    requestReject = async (error: any) => {
        return await Promise.reject(error)
    };

    responseFulfilled = (response: AxiosResponse) => {
        return response
    };

    responseReject = async (error: ResponseModel<any>) => {
        if (error.config?.url == urls.refreshToken && error.response.status == 422 && !isForceLogout) {
            isForceLogout = true
            isRefreshing = false
            this._userRepository.logout(true).then((value) => {
                emitShowToast({ type: 'forceLogout', toastMessage: getString('tokenTimeout'), numberOfLines: 2 })
                setTimeout(() => {
                    isForceLogout = false
                }, 2000);
            })
            return;
        }
        let status = 0
        if (error.response != null && !isForceLogout) {
            status = error.response.status
            if (status == 401) {

                const originalRequest = error.config ?? {}
                if (!isRefreshing) {
                    isRefreshing = true
                    // call api refreshToken:
                    this._userRepository.refreshToken()
                        .then((response: AxiosResponse) => {
                            isRefreshing = false;
                            onRefreshed(response?.data!.access_token, response?.data!.refresh_token);
                        });
                }

                const retryOrigReq = new Promise((resolve, reject) => {
                    const handler: RefreshTokenCallback = async (token, refreshToken) => {
                        // replace the expired token and retry
                        if ((originalRequest?.headers) == null) {
                            originalRequest.headers = {}
                        }
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        await this._userRepository.setTokenUser({ token: token, refreshToken: refreshToken })

                        resolve(this.axiosInstance.request(originalRequest))
                    };
                    subscribeTokenRefresh(handler)
                })
                return await retryOrigReq
            } else {
                return await Promise.reject(error)
            }
        }

        return await Promise.reject(error)
    };
}

const subscribeTokenRefresh = (cb: RefreshTokenCallback) => {
    refreshSubscribers.push(cb)
}

const onRefreshed = (token: string, refreshToken?: string) => {
    refreshSubscribers.map(cb => cb(token, refreshToken))
    refreshSubscribers = []
}
