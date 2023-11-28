import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { KeyZustand, StoreKey } from './keyZustand';

/// AsyncStorage function
export const getLocal = async (key: keyof StoreKey): Promise<any> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        if (!jsonValue || jsonValue == null || JSON.parse(jsonValue) == 'undefined' || !JSON.parse(jsonValue))
            return undefined
        return JSON.parse(jsonValue)
    } catch (e) {
        console.info('localStoreRepo get Error: ', e)
        return undefined
    }
}

export const setLocal = async (key: keyof StoreKey, data: any): Promise<boolean> => {
    try {
        const jsonValue = JSON.stringify(data)
        await AsyncStorage.setItem(key, jsonValue)
        return true
    } catch (e) {
        console.info('localStoreRepo set Error: ', e)
        return false
    }
}

export const removeLocal = async (key: keyof StoreKey): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(key)
        return true
    } catch (e) {
        console.info('localStoreRepo remove Error: ', e)
        return false
    }
}

// zustand
interface IRootState {
    state: { [key in keyof KeyZustand]?: any },
    save: <K extends keyof KeyZustand>(key: K, value: KeyZustand[K]) => void,
    get: (key: keyof KeyZustand) => any
}

type UseSave = () => (key: keyof KeyZustand, value: any) => void
type UseGet = <K extends keyof KeyZustand>(key: K) => KeyZustand[K]

// @ts-ignore
const StoreZustand: UseBoundStore<StoreApi<IRootState>> = create((set) => ({
    state: {},
    save: (key: keyof KeyZustand, value: any) => {
        if (key in {} as unknown as StoreKey) {
            setLocal(key, value)
            return set((rootState: IRootState) => ({
                state: {
                    ...rootState.state,
                    [key]: value,
                },
            }));
        }

        return set((rootState: IRootState) => ({
            state: {
                ...rootState.state,
                [key]: value,
            },
        }));
    },
    get: (key: keyof KeyZustand) => {
        // @ts-ignore
        return rootState?.state?.[key]
    },
}));

// @ts-ignore
export const useSave: UseSave = () => StoreZustand((rootState) => rootState?.save);
export const useGet: UseGet = (key: keyof KeyZustand) => StoreZustand((rootState) => rootState?.state?.[key]);
export default StoreZustand 