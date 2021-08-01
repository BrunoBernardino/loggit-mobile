import React, { Component } from 'react';
import { StatusBar, Alert } from 'react-native';
import { AppearanceProvider, Appearance } from 'react-native-appearance';
import { RxDatabase, isRxDatabase } from 'rxdb';
import moment from 'moment';

import Notification from '../components/Notification';
import DB from '../lib/db';

import * as T from '../lib/types';

interface LayoutProps {}
interface LayoutState {
  isUsingDarkMode: boolean;
  isLoading: boolean;
  isShowingNotification: boolean;
  notificationMessage: string;
  monthInView: string;
  lastSyncDate: string;
  events: T.Event[];
}

const notificationTimeoutInMS = 10 * 1000;

const withLayout: any = (WrappedComponent: any, sharedOptions: any) => {
  class LayoutComponent extends Component<LayoutProps, LayoutState> {
    notificationTimeout = null;

    db: RxDatabase | null = null;

    constructor(props: LayoutProps) {
      super(props);

      this.db = sharedOptions.db;

      this.state = {
        isUsingDarkMode: false,
        isLoading: true,
        isShowingNotification: false,
        notificationMessage: '',
        monthInView: moment().format('YYYY-MM'),
        lastSyncDate: '',
        events: [],
      };
    }

    componentDidMount() {
      this.loadData();
    }

    componentWillUnmount() {
      this.hideNotification();

      this.cleanupDB();
    }

    cleanupDB = async () => {
      if (sharedOptions.db) {
        try {
          sharedOptions.db._subs.forEach((subscriber: any) =>
            subscriber.unsubscribe(),
          );
          await sharedOptions.db.destroy();
          sharedOptions.db = null;
          this.db = null;
        } catch (error) {
          console.log('Error cleaning up DB');
          console.log(error);
        }
      }
    };

    showAlert = (title: string, message: string) => {
      Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }], {
        cancelable: false,
      });
    };

    showNotification = (message: string) => {
      this.setState({
        isShowingNotification: true,
        notificationMessage: message,
      });

      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }

      this.notificationTimeout = setTimeout(
        () => this.hideNotification(),
        notificationTimeoutInMS,
      );
    };

    hideNotification = () => {
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }

      this.setState({
        isShowingNotification: false,
        notificationMessage: '',
      });
    };

    ensureDBConnection = async (forceReload = false) => {
      if (!isRxDatabase(this.db) || !this.db || !this.db.events) {
        forceReload = true;
      }

      if (forceReload) {
        await this.cleanupDB();

        if (!sharedOptions.db) {
          sharedOptions.db = await DB.connect();
        }

        this.db = sharedOptions.db;
      }
    };

    loadData = async (
      options: {
        monthToLoad?: string;
        forceReload?: boolean;
      } = {},
    ) => {
      const { monthToLoad, forceReload } = options;

      await this.ensureDBConnection(forceReload);

      const { monthInView } = this.state;

      this.showLoading();

      this.setState({
        events: [],
        isUsingDarkMode: Appearance.getColorScheme() === 'dark',
      });

      const events = await DB.fetchEvents(this.db, monthToLoad || monthInView);

      const lastSyncDate = await DB.fetchSetting('lastSyncDate');

      this.setState(
        {
          events,
          lastSyncDate,
        },
        this.hideLoading,
      );
    };

    fetchAllEvents = async () => {
      await this.ensureDBConnection();

      const events = await DB.fetchAllEvents(this.db);

      return events;
    };

    showLoading = () => {
      this.setState({ isLoading: true });
    };

    hideLoading = () => {
      this.setState({ isLoading: false });
    };

    changeMonthInView = async (newMonth: string) => {
      const nextMonth = moment().add(1, 'month').format('YYYY-MM');

      if (newMonth > nextMonth) {
        this.showAlert('Warning', 'Cannot travel further into the future!');
        return;
      }

      this.setState({ monthInView: newMonth });

      await this.loadData({ monthToLoad: newMonth });
    };

    saveEvent = async (event: T.Event) => {
      try {
        await this.ensureDBConnection();
        await DB.saveEvent(this.db, event);
        await this.loadData();
        return true;
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return false;
      }
    };

    getSetting = async (settingName: T.SettingOption) => {
      await this.ensureDBConnection();
      return DB.fetchSetting(settingName);
    };

    saveSetting = async (setting: T.Setting) => {
      try {
        await this.ensureDBConnection();
        await DB.saveSetting(setting);
        await this.loadData({ forceReload: true });
        return true;
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return false;
      }
    };

    deleteEvent = async (eventId: string) => {
      try {
        await this.ensureDBConnection();
        await DB.deleteEvent(this.db, eventId);
        await this.loadData();
        return true;
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return false;
      }
    };

    importData = async (replaceData: boolean, events: T.Event[]) => {
      try {
        await this.ensureDBConnection();
        await DB.importData(this.db, replaceData, events);
        await this.loadData({ forceReload: true });
        return true;
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return false;
      }
    };

    exportAllData = async () => {
      try {
        await this.loadData({ forceReload: true });
        return DB.exportAllData(this.db);
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return { events: [] };
      }
    };

    deleteAllData = async () => {
      try {
        await this.loadData({ forceReload: true });
        await DB.deleteAllData(this.db);
        await this.db.remove();
        await this.loadData({ forceReload: true });
        return true;
      } catch (error) {
        this.showAlert('Error', error.message);
        console.log(error);
        return false;
      }
    };

    render = () => {
      const {
        isUsingDarkMode,
        isLoading,
        isShowingNotification,
        notificationMessage,
        monthInView,
        lastSyncDate,
        events,
      } = this.state;

      return (
        <AppearanceProvider>
          <StatusBar backgroundColor="#fff" barStyle="dark-content" />
          <Notification
            isShowing={isShowingNotification}
            message={notificationMessage}
            hideNotification={this.hideNotification}
          />
          <WrappedComponent
            {...this.props}
            isUsingDarkMode={isUsingDarkMode}
            isLoading={isLoading}
            monthInView={monthInView}
            lastSyncDate={lastSyncDate}
            events={events}
            loadData={this.loadData}
            fetchAllEvents={this.fetchAllEvents}
            showLoading={this.showLoading}
            hideLoading={this.hideLoading}
            showAlert={this.showAlert}
            showNotification={this.showNotification}
            changeMonthInView={this.changeMonthInView}
            saveEvent={this.saveEvent}
            getSetting={this.getSetting}
            saveSetting={this.saveSetting}
            deleteEvent={this.deleteEvent}
            importData={this.importData}
            exportAllData={this.exportAllData}
            deleteAllData={this.deleteAllData}
          />
        </AppearanceProvider>
      );
    };
  }

  return LayoutComponent;
};

export default withLayout;
