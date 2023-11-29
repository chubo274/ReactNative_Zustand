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

// after crate new key interface above, need add default value for this variable. It needed when use Object.keys
export const useOnlyGetStoreKey: StoreKey = {
    Token: {},
    Localization: LANGUAGES.ENGLISH,
    ThemeApp: ModeTheme.Default
}