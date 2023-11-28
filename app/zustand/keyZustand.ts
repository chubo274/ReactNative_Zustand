import { LANGUAGES } from 'shared/localization'
import { ModeTheme } from 'shared/theme';
import { ISessionStorage } from './interfaceZustand';

export interface KeyZustand extends StoreKey {
}

export interface StoreKey {
    Token: ISessionStorage,
    Localization: LANGUAGES,
    ThemeApp: ModeTheme,
}

export const useOnlyGetStoreKey: StoreKey = {
    Token: {},
    Localization: LANGUAGES.ENGLISH,
    ThemeApp: ModeTheme.Default
}