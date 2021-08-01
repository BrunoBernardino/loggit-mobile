import 'react-native-get-random-values';

import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RxDatabase } from 'rxdb';

import { withLayout } from './hocs';
import SettingsPage from './pages/settings';
import StatsPage from './pages/stats';
import EventsPage from './pages/events';
import AddPage from './pages/add';

const db: RxDatabase = null;
const sharedOptions = { db };

type IconType =
  | 'ios-add-circle'
  | 'ios-checkmark-done'
  | 'ios-analytics'
  | 'ios-settings-sharp';

const TabNavigator = createBottomTabNavigator(
  {
    Settings: withLayout(SettingsPage, sharedOptions),
    Stats: withLayout(StatsPage, sharedOptions),
    Events: withLayout(EventsPage, sharedOptions),
    Add: withLayout(AddPage, sharedOptions),
  },
  {
    initialRouteName: 'Add',
    defaultNavigationOptions: ({ navigation }) => ({
      // eslint-disable-next-line
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        let iconName: IconType;
        if (routeName === 'Add') {
          iconName = 'ios-add-circle';
        } else if (routeName === 'Events') {
          iconName = 'ios-checkmark-done';
        } else if (routeName === 'Stats') {
          iconName = 'ios-analytics';
        } else if (routeName === 'Settings') {
          iconName = 'ios-settings-sharp';
        }

        return <Ionicons name={iconName} size={30} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#F31051',
      inactiveTintColor: '#430426',
      showLabel: false,
      style: {
        paddingTop: 8,
      },
    },
  },
);

const App = createAppContainer(TabNavigator);

export default App;
