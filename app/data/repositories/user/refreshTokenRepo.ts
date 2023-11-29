import { SessionStorage } from 'app/App'
import ApiGateway from 'app/data/api'
import { urls } from 'app/data/api/resource'
import { UserModel } from 'app/models/user/UserModel'
import { ISessionStorage } from 'app/zustand/interfaceZustand'
import { AxiosResponse } from 'axios'
import { setTokenUser } from 'shared/helpers/function'

/**
 * Always store token in session storage for faster retrieve
 * @type {{token: string}}
 */

export const refreshTokenRepo = async (): Promise<AxiosResponse<boolean>> => {
    const resource = urls.refreshToken

    return ApiGateway.execute({
        method: 'POST',
        resource,
        body: { refresh_token: SessionStorage.refreshToken }
    }).then(async response => {
        if (response.data) {
            response.data = UserModel.parseFromJson(response.data)
        }
        const token: ISessionStorage = { token: response?.data?.token, refreshToken: response?.data?.refreshToken }
        setTokenUser(token)
        return response
    })
}