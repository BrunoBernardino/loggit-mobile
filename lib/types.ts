export type Event = {
  id: string;
  name: string;
  date: string;
  _rev?: string;
};

export type SettingOption = 'syncToken' | 'lastSyncDate';

export type Setting = {
  name: SettingOption;
  value: string;
};

export interface WrappedComponentProps {
  isFocused: boolean;
  isUsingDarkMode: boolean;
  isLoading: boolean;
  monthInView: string;
  lastSyncDate: string;
  currency: string;
  events: Event[];
  loadData: (options?: {
    monthToLoad?: string;
    forceReload?: boolean;
  }) => Promise<void>;
  fetchAllEvents: () => Promise<Event[]>;
  showLoading: () => void;
  hideLoading: () => void;
  showAlert: (title: string, message: string) => void;
  showNotification: (message: string) => void;
  changeMonthInView: (newMonth: string) => void;
  saveEvent: (event: Event) => Promise<boolean>;
  getSetting: (settingName: string) => Promise<string>;
  saveSetting: (setting: Setting) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  importData: (replaceData: boolean, events: Event[]) => Promise<boolean>;
  exportAllData: () => Promise<{ events: Event[] }>;
  deleteAllData: () => Promise<boolean>;
}
