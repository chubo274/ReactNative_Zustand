import { useLogin } from 'app/data/hooks/user/useLogin';
import { backToTopAuthStack } from 'app/modules/navigation';
import { AppButton } from 'components/button/AppButton';
import { AppText } from 'components/text/AppText';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native'
import { ITheme, useAppTheme } from 'shared/theme';

const HomeScreen = () => {
    const theme = useAppTheme();
    const styles = useStyles(theme)
    const { t } = useTranslation()
    const { fetch } = useLogin()

    const onLogout = useCallback(() => {
        backToTopAuthStack()
    }, [])

    const callApi = useCallback(() => {
        fetch({ params: { email: '', password: '' } })
    }, [fetch])

    return <View style={styles.container}>
        <AppText>Home</AppText>
        <AppButton
            title={t('logout')}
            onPress={onLogout}
            style={styles.btn}
        />
        <AppButton
            title={'change url login in repositories to test'}
            onPress={callApi}
            style={styles.btn}
        />
    </View>
}

export default HomeScreen

const useStyles = (theme: ITheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        backgroundColor: 'transparent',
        height: 48,
        borderWidth: 1,
        borderColor: 'yellow',
        marginBottom: 12,
    }
})
