import { SessionStorage } from 'app/App'
import ApiGateway from 'app/data/api'
import { urls } from 'app/data/api/resource'
import { ResponseModel } from 'app/models/common'
import { backToTopAuthStack } from 'app/modules/navigation'
import StoreZustand from 'app/zustand'
import { AxiosResponse } from 'axios'

/**
 * Always store token in session storage for faster retrieve
 * @type {{token: string}}
 */

export const logoutRepo = async (isForceLogout?: boolean): Promise<AxiosResponse<boolean>> => {
    const resource = urls.logout

    if (isForceLogout) {
        return ResponseModel.createSuccess({ status: 200, statusText: '200', data: true, })
    }

    return ApiGateway.execute({
        method: 'DELETE',
        resource,
    }).then(async response => {
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