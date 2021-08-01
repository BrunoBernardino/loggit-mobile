import {
  RxDatabase,
  RxJsonSchema,
  RxDocument,
  addRxPlugin,
  createRxDatabase,
  PouchDB,
} from 'rxdb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import { sortByDate, splitArrayInChunks } from './utils';

import * as T from './types';

interface DB {
  _hasFinishedFirstSync: {
    events: boolean;
  };
  updateSyncDate: (alive: boolean) => Promise<void>;
  connect: () => Promise<RxDatabase>;
  fetchEvents: (db: RxDatabase, month: string) => Promise<T.Event[]>;
  fetchAllEvents: (db: RxDatabase) => Promise<T.Event[]>;
  fetchSetting: (name: T.SettingOption) => Promise<string>;
  saveEvent: (db: RxDatabase, event: T.Event) => Promise<void>;
  saveSetting: (setting: T.Setting) => Promise<void>;
  deleteEvent: (db: RxDatabase, eventId: string) => Promise<void>;
  importData: (
    db: RxDatabase,
    replaceData: boolean,
    events: T.Event[],
  ) => Promise<void>;
  exportAllData: (db: RxDatabase) => Promise<{ events: T.Event[] }>;
  deleteAllData: (localDb: RxDatabase) => Promise<void>;
}

type EventDocument = RxDocument<T.Event>;
const eventSchema: RxJsonSchema<T.Event> = {
  title: 'event schema',
  description: 'describes an event',
  version: 0,
  keyCompression: true,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
  },
  required: ['name', 'date'],
};

addRxPlugin(require('pouchdb-adapter-asyncstorage'));
addRxPlugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('pouchdb-erase'));

const localDbName = 'localdb_loggit_v0';

const DB: DB = {
  _hasFinishedFirstSync: {
    events: false,
  },
  updateSyncDate: async (alive = true) => {
    const lastSyncDate = moment().format('YYYY-MM-DD HH:mm:ss');
    if (alive) {
      await DB.saveSetting({
        name: 'lastSyncDate',
        value: alive ? lastSyncDate : '',
      });
    }
  },
  connect: async () => {
    try {
      const syncToken = await DB.fetchSetting('syncToken');

      const db = await createRxDatabase({
        name: localDbName,
        adapter: 'asyncstorage',
        multiInstance: false,
        ignoreDuplicate: true,
      });

      await db.collection({
        name: 'events',
        schema: eventSchema,
      });

      if (syncToken.length > 0) {
        const syncOptions = {
          remote: syncToken,
          options: {
            live: true,
            retry: true,
          },
        };
        const eventsSync = db.events.sync(syncOptions);

        eventsSync.alive$.subscribe((alive) => DB.updateSyncDate(alive));
        eventsSync.change$.subscribe((change) => DB.updateSyncDate(change.ok));
        eventsSync.complete$.subscribe(() => {
          DB._hasFinishedFirstSync.events = true;
        });
      } else {
        DB._hasFinishedFirstSync.events = true;
      }

      return db;
    } catch (error) {
      console.log('Failed to connect to DB');
      console.log(error);
      console.log(JSON.stringify(error));
      return null;
    }
  },
  fetchEvents: async (db, month) => {
    try {
      const events: EventDocument[] = await db.events
        .find()
        .where('date')
        .gte(`${month}-01`)
        .lte(`${month}-31`)
        .exec();
      return events
        .map((event) => event.toJSON())
        .sort(sortByDate)
        .reverse();
    } catch (error) {
      console.log('Failed to fetch events');
      console.log(error);
      return [];
    }
  },
  fetchAllEvents: async (db) => {
    try {
      const events: EventDocument[] = await db.events
        .find()
        .where('date')
        .gte('2000-01')
        .lte('2100-31')
        .exec();
      return events
        .map((event) => event.toJSON())
        .sort(sortByDate)
        .reverse();
    } catch (error) {
      console.log('Failed to fetch events');
      console.log(error);
      return [];
    }
  },
  fetchSetting: async (name) => {
    const value = await AsyncStorage.getItem(`setting_${name}`);
    return value || '';
  },
  saveEvent: async (db, event) => {
    if (event.name.trim().length === 0) {
      throw new Error('The event needs a valid name.');
    }

    if (!moment(event.date, 'YYYY-MM-DD').isValid()) {
      event.date = moment().format('YYYY-MM-DD');
    }

    if (event.id === 'newEvent') {
      await db.events.insert({
        ...event,
        id: `${Date.now().toString()}:${Math.random()}`,
      });
    } else {
      const existingEvent: EventDocument = await db.events
        .findOne()
        .where('id')
        .eq(event.id)
        .exec();
      await existingEvent.update({
        $set: {
          name: event.name,
          date: event.date,
        },
      });
    }
  },
  saveSetting: async (setting) => {
    await AsyncStorage.setItem(`setting_${setting.name}`, setting.value);
  },
  deleteEvent: async (db, eventId) => {
    const existingEvent: EventDocument = await db.events
      .findOne()
      .where('id')
      .eq(eventId)
      .exec();
    await existingEvent.remove();
  },
  importData: async (db, replaceData, events) => {
    if (replaceData) {
      await DB.deleteAllData(db);

      // Recreate collections
      await db.collection({
        name: 'events',
        schema: eventSchema,
      });
    }

    const chunkLength = 200;

    if (events.length > chunkLength) {
      const chunkedEvents = splitArrayInChunks(events, chunkLength);
      for (const eventsChunk of chunkedEvents) {
        await db.events.bulkInsert(eventsChunk);
        // Wait a second, to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      await db.events.bulkInsert(events);
    }
  },
  exportAllData: async (db) => {
    // NOTE: The queries look weird because .dump() and simple .find() were returning indexes and other stuff
    const events: EventDocument[] = await db.events
      .find()
      .where('date')
      .gte('2000-01-01')
      .lte('2100-12-31')
      .exec();
    const sortedEvents = events
      .map((event) => {
        const rawEvent = event.toJSON();
        delete rawEvent._rev;
        return rawEvent;
      })
      .sort(sortByDate);
    return { events: sortedEvents };
  },
  deleteAllData: async (localDb: RxDatabase) => {
    await localDb.events.remove();

    const db = new PouchDB(localDbName);
    // @ts-ignore erase comes from pouchdb-erase
    db.erase();
    const syncToken = await DB.fetchSetting('syncToken');
    if (syncToken.length > 0) {
      const remoteDb = new PouchDB(syncToken);
      // @ts-ignore erase comes from pouchdb-erase
      await remoteDb.erase();
    }
  },
};

export default DB;
