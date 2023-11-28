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

    const onLogout = useCallback(() => {
        backToTopAuthStack()
    }, [])

    return <View style={styles.container}>
        <AppText>Home</AppText>
        <AppButton
            title={t('logout')}
            onPress={onLogout}
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
    }
})
