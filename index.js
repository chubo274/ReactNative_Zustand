/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './app/App';
import {name as appName} from './app.json';
import {configureLocalization} from 'shared/localization';

LogBox.ignoreLogs([
    `react-i18next:: You will need to pass in an i18next instance by using initReactI18next`,
]);

configureLocalization('vn'); // fixed React has detected a change in the order of Hooks called by withI18nextTranslation

AppRegistry.registerComponent(appName, () => App);
