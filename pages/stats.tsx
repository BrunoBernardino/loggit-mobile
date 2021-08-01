import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image,
  FlatList,
} from 'react-native';
import moment from 'moment';

import Logo from '../assets/logo.png';
import EventStat from '../components/EventStat';

import { sortByCount } from '../lib/utils';

import * as T from '../lib/types';

interface AddPageProps extends T.WrappedComponentProps {}
interface AddPageState {
  events: T.Event[];
}

interface GroupedEvent {
  count: number;
  firstLog: string;
  lastLog: string;
}
interface GroupedEventsByName {
  [name: string]: GroupedEvent;
}

const calculateFrequencyFromGrouppedEvent = (groupedEvent: GroupedEvent) => {
  const monthDifference = Math.abs(
    moment(groupedEvent.firstLog, 'YYYY-MM-DD').diff(
      moment(groupedEvent.lastLog, 'YYYY-MM-DD'),
      'months',
    ),
  );

  // This event has only existed for less than a month, so we can't know if it'll repeat any more
  if (monthDifference <= 1) {
    return `${groupedEvent.count}x / year`;
  }

  const frequencyNumberPerMonth = Math.ceil(
    groupedEvent.count / monthDifference,
  );

  // When potentially less than once per month, check frequency per year
  if (frequencyNumberPerMonth === 1) {
    // Consider 6 months more of "nothing happening" between these, as it's a hard guess for something logged once a long time ago
    const frequencyNumberPerYear = Math.ceil(
      (groupedEvent.count / (monthDifference + 6)) * 12,
    );

    if (frequencyNumberPerYear < 12) {
      return `${frequencyNumberPerYear}x / year`;
    }
  }

  if (frequencyNumberPerMonth < 15) {
    return `${frequencyNumberPerMonth}x / month`;
  }

  const frequencyNumberPerWeek = Math.ceil(
    groupedEvent.count / monthDifference / 4,
  );

  if (frequencyNumberPerWeek < 7) {
    return `${frequencyNumberPerMonth}x / week`;
  }

  const frequencyNumberPerDay = Math.ceil(
    groupedEvent.count / monthDifference / 30,
  );

  return `${frequencyNumberPerDay}x / day`;
};

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },

  logo: {
    marginTop: 40,
    height: 40,
    width: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  statsTip: {
    color: '#333',
    textAlign: 'center',
    alignItems: 'center',
    marginVertical: 22,
    marginHorizontal: 6,
  },

  noEventsFound: {
    color: '#999',
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
    marginVertical: 32,
    fontSize: 16,
    lineHeight: 22,
    marginHorizontal: 6,
  },

  topEventList: {
    flex: 1,
  },
});

class StatsPage extends Component<AddPageProps, AddPageState> {
  inputAccessoryViewID = 'doneViewID';

  constructor(props: AddPageProps) {
    super(props);

    this.state = {
      events: [],
    };
  }

  componentDidMount = () => {
    this.reloadEvents();
  };

  componentDidUpdate = ({ events: prevEvents }) => {
    const { events: newEvents } = this.props;

    if (newEvents.length > 0 && newEvents.length !== prevEvents.length) {
      this.reloadEvents();
    }
  };

  reloadEvents = async () => {
    const { fetchAllEvents } = this.props;

    const events = await fetchAllEvents();

    this.setState({ events });
  };

  render() {
    const { isLoading, loadData } = this.props;
    const { events } = this.state;

    const eventsByName: GroupedEventsByName = {};

    // Group events by name, and count them, and register first and last times logged
    events.forEach((event) => {
      if (Object.prototype.hasOwnProperty.call(eventsByName, event.name)) {
        eventsByName[event.name].count += 1;
        if (event.date < eventsByName[event.name].firstLog) {
          eventsByName[event.name].firstLog = event.date;
        }
        if (event.date > eventsByName[event.name].lastLog) {
          eventsByName[event.name].lastLog = event.date;
        }
      } else {
        eventsByName[event.name] = {
          count: 1,
          firstLog: event.date,
          lastLog: event.date,
        };
      }
    });

    // Sort events by count, and truncate at maxTopEventCount
    const maxTopEventCount = 10;
    const topEvents = Object.keys(eventsByName)
      .map((eventName) => ({
        id: `${Date.now().toString()}:${Math.random()}`,
        name: eventName,
        count: eventsByName[eventName].count,
        frequency: calculateFrequencyFromGrouppedEvent(eventsByName[eventName]),
        lastDate: eventsByName[eventName].lastLog,
      }))
      .sort(sortByCount)
      .slice(0, maxTopEventCount);

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <Image style={styles.logo} source={Logo} />
          <Text style={styles.statsTip}>
            Below you can see some stats for your top 10 logged events, and the
            date it was last logged.
          </Text>
          <FlatList
            refreshing={isLoading}
            onRefresh={() => loadData({ forceReload: true })}
            data={topEvents}
            style={styles.topEventList}
            renderItem={({ item }) => <EventStat {...item} />}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.noEventsFound}>
                Hello there! It looks like this is your first time using the
                app.{'\n\n'}Go add a new event!
              </Text>
            }
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default StatsPage;
