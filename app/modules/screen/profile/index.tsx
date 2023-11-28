import { useGet } from 'app/zustand';
import { AppButton } from 'components/button/AppButton';
import { AppText } from 'components/text/AppText';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { changeLanguage, LANGUAGES } from 'shared/localization';
import { ITheme, useAppTheme } from 'shared/theme';

const ProfileScreen = () => {
    const theme = useAppTheme();
    const styles = useStyles(theme)
    const { t } = useTranslation()
    const getLanguage = useGet('Localization')

    const onChangeLanguage = useCallback(() => {
        changeLanguage(getLanguage == LANGUAGES.VIETNAM ? LANGUAGES.ENGLISH : LANGUAGES.VIETNAM)
    }, [getLanguage])

    return <View style={styles.container}>
        <AppText>Profile</AppText>
        <AppButton
            title={t('changeLanguage')}
            onPress={onChangeLanguage}
        />
    </View>
}

export default ProfileScreen

const useStyles = (theme: ITheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
