import { SessionStorage } from 'app/App'
import StoreZustand from 'app/zustand'
import { ISessionStorage } from 'app/zustand/interfaceZustand'
import { IAppToast } from 'components/toast/AppToast'
import { DeviceEventEmitter } from 'react-native'
import { EmitType } from './constant'

/// parse formData for body api
export const parseFormData = (data: any, keepFormData?: boolean): FormData => {
    const bodyFormData = new FormData()
    Object.keys(data).forEach((key: string) => {
        if (Array.isArray(data[key])) {
            data[key].forEach((value: any) => {
                bodyFormData.append(`${key}[]`, value)
            })
        } else {
            bodyFormData.append(key, data[key])
        }
    })
    return bodyFormData
}

export const setTokenUser = (responseParsed: ISessionStorage) => {
    SessionStorage.token = responseParsed?.token ?? ''
    SessionStorage.refreshToken = responseParsed?.refreshToken ?? ''
    return StoreZustand.getState()?.save('Token', SessionStorage)
}

// parseMaxLengthText
export const maxLengthText = (maxLengthText: number, string?: string) => {
    if (!string) return ''
    if (string && string.length <= maxLengthText) return string
    return string.substring(0, maxLengthText) + '...'
}

// EventEmitter
export const emitShowToast = (params: IAppToast) => {
    DeviceEventEmitter.emit(EmitType.AppToast, params)
}

export const emitShowAppLoading = (isShow: boolean) => {
    DeviceEventEmitter.emit(EmitType.AppLoading, isShow)
}
