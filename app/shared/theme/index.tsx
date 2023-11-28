import { useGet, useSave } from 'app/zustand';
import React, { useCallback, useContext, useMemo } from 'react';
import AppColor from './color/colors';
import AppColorSakura from './color/colorsSakura';
import { IAppColor } from './color/IAppColor';
import dimensions from './dimensions';
import { AppFont } from './fonts';
import { globalShadowStyle } from './globalStyle';

export interface ITheme {
    color: IAppColor,
    dimensions: typeof dimensions.dimensions,
    fontSize: typeof dimensions.fontSize,
    font: typeof AppFont,
    globalStyle: typeof globalShadowStyle,
    changeTheme: (value?: ModeTheme) => void,
}

export enum ModeTheme {
    Default = 1,
    Sakura = 2,
}

const ThemeContext = React.createContext<ITheme>({
    color: AppColor,
    dimensions: dimensions.dimensions,
    fontSize: dimensions.fontSize,
    font: AppFont,
    globalStyle: globalShadowStyle,
    changeTheme: (value?: ModeTheme) => null,
});

export const useAppTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: any) => {
    const save = useSave()
    const themeColor = useGet('ThemeApp')

    const changeTheme = useCallback((value?: ModeTheme) => {
        const nextValue = value ?? ModeTheme.Default
        if (nextValue != themeColor) {
            save('ThemeApp', nextValue)
        }
    }, [themeColor, save])

    const sourceColor = useMemo(() => {
        switch (themeColor) {
            case ModeTheme.Sakura:
                return AppColorSakura;
            default:
                return AppColor;
        }
    }, [themeColor])

    const theme = useMemo((): ITheme => {
        return {
            color: sourceColor,
            dimensions: dimensions.dimensions,
            fontSize: dimensions.fontSize,
            font: AppFont,
            globalStyle: globalShadowStyle,
            changeTheme,
        }
    }, [changeTheme, sourceColor]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
};

export default ThemeProvider;
