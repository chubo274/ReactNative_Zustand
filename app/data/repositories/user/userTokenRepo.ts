import { SessionStorage } from 'app/App'
import ApiGateway from 'app/data/api'
import { ResourceType } from 'app/data/api/interceptor/Interceptor'
import { urls } from 'app/data/api/resource'
import { ResponseModel } from 'app/models/common'
import { UserModel } from 'app/models/user/UserModel'
import { backToTopAuthStack } from 'app/modules/navigation'
import StoreZustand from 'app/zustand'
import { ISessionStorage } from 'app/zustand/interfaceZustand'

/**
 * Always store token in session storage for faster retrieve
 * @type {{token: string}}
 */

interface IPostLoginRequest {
    email: string
    password: string
}

export const login = async (body: IPostLoginRequest): Promise<ResponseModel<UserModel>> => {
    const resource = urls.ditto // test by api pokenmon
    // const resource = urls.login
    ApiGateway.setConfig({
        method: 'GET',
        resource,
        resourceType: ResourceType.Auth,
        body,
    })

    return ApiGateway.execute().then(async response => {
        if (response.data) {
            response.data = UserModel.parseFromJson(response.data)
        }
        // that trust example
        const token: ISessionStorage = { token: response?.data?.token, refreshToken: response?.data?.refreshToken }
        setTokenUser(token)
        return response
    })
}

export const setTokenUser = (responseParsed: ISessionStorage) => {
    SessionStorage.token = responseParsed?.token ?? ''
    SessionStorage.refreshToken = responseParsed?.refreshToken ?? ''
    return StoreZustand.getState()?.save('Token', SessionStorage)
}

export const logout = async (isForceLogout?: boolean): Promise<ResponseModel<boolean>> => {
    const resource = urls.logout

    ApiGateway.setConfig({
        method: 'DELETE',
        resource,
        resourceType: ResourceType.Auth,
    })

    if (isForceLogout) {
        return ResponseModel.createSuccess({ status: 200, statusText: '200', data: true, })
    }

    return ApiGateway.execute().then(async response => {
        if (response.data) {
            response.data = true
        }
        return response;
    }).finally(() => {
        SessionStorage.token = ''
        SessionStorage.refreshToken = ''
        StoreZustand.getState()?.save('Token', {})
        setTimeout(() => {
            backToTopAuthStack()
        }, 300);
    })
}

export const refreshToken = async (): Promise<ResponseModel<boolean>> => {
    const resource = urls.refreshToken
    ApiGateway.setConfig({
        method: 'POST',
        resource,
        resourceType: ResourceType.Auth,
        body: { refresh_token: SessionStorage.refreshToken }
    })

    return ApiGateway.execute().then(async response => {
        if (response.data) {
            response.data = UserModel.parseFromJson(response.data)
        }
        const token: ISessionStorage = { token: response?.data?.token, refreshToken: response?.data?.refreshToken }
        setTokenUser(token)
        return response
    })
}

