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

interface IPostLoginRequest {
    email: string
    password: string
}

export const loginRepo = async (body: IPostLoginRequest): Promise<AxiosResponse<UserModel>> => {
    const resource = urls.login
    return ApiGateway.execute({
        method: 'GET',
        resource,
        body,
    }).then(async response => {
        if (response.data) {
            response.data = UserModel.parseFromJson(response.data)
        }
        const token: ISessionStorage = { token: response?.data?.token, refreshToken: response?.data?.refreshToken }
        setTokenUser(token)
        return response
    })
}