import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image,
  FlatList,
} from 'react-native';

import PrimaryButton from '../components/Button';
import Logo from '../assets/logo.png';
import AddEventModal from '../components/EditEventModal';
import Event from '../components/Event';
import { sortByCount } from '../lib/utils';

import * as T from '../lib/types';

interface AddPageProps extends T.WrappedComponentProps {}
interface AddPageState {
  isSubmitting: boolean;
  isAddEventModalVisible: boolean;
  events: T.Event[];
}

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

  logEventTip: {
    color: '#333',
    textAlign: 'center',
    alignItems: 'center',
    marginVertical: 16,
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

  addButton: {
    marginVertical: 10,
    minHeight: 16,
    flex: 0.1,
  },
});

class AddPage extends Component<AddPageProps, AddPageState> {
  inputAccessoryViewID = 'doneViewID';

  constructor(props: AddPageProps) {
    super(props);

    this.state = {
      isSubmitting: false,
      isAddEventModalVisible: false,
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

  addEvent = async (newEvent: T.Event) => {
    const { saveEvent, showNotification, loadData } = this.props;
    const { isSubmitting } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return false;
    }

    this.setState({ isSubmitting: true });

    try {
      const success = await saveEvent(newEvent);

      if (success) {
        this.setState({ isAddEventModalVisible: false });
        showNotification('Event logged successfully.');
      }
    } catch (error) {
      console.log('Failed to log event');
      console.log(error);
    }

    this.setState({ isSubmitting: false });
    loadData({ forceReload: true });

    return true;
  };

  render() {
    const { isLoading, loadData, isUsingDarkMode } = this.props;
    const { isSubmitting, isAddEventModalVisible, events } = this.state;

    const eventsByName: { [key: string]: { count: number } } = {};

    // Group events by name, and count them
    events.forEach((event) => {
      if (Object.prototype.hasOwnProperty.call(eventsByName, event.name)) {
        eventsByName[event.name].count += 1;
      } else {
        eventsByName[event.name] = {
          count: 1,
        };
      }
    });

    // Sort events by count, and truncate at maxTopEventCount
    const maxTopEventCount = 15;
    const topEvents = Object.keys(eventsByName)
      .map((eventName) => ({
        id: `${Date.now().toString()}:${Math.random()}`,
        name: eventName,
        count: eventsByName[eventName].count,
        date: '',
      }))
      .sort(sortByCount)
      .slice(0, maxTopEventCount);

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <Image style={styles.logo} source={Logo} />
          <Text style={styles.logEventTip}>
            Tap on an event name below to quickly log it again.
          </Text>
          <FlatList
            refreshing={isLoading}
            onRefresh={() => loadData({ forceReload: true })}
            data={topEvents}
            style={styles.topEventList}
            renderItem={({ item }) => (
              <Event
                {...item}
                onPress={() =>
                  this.addEvent({ id: 'newEvent', name: item.name, date: '' })
                }
                showDate={false}
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.noEventsFound}>
                Hello there! It looks like this is your first time using the
                app.{'\n\n'}Log a new event using the button below!
              </Text>
            }
          />
          <AddEventModal
            isUsingDarkMode={isUsingDarkMode}
            isVisible={isAddEventModalVisible}
            onDismiss={() =>
              this.setState({
                isAddEventModalVisible: false,
              })
            }
            onSaveEvent={this.addEvent}
            event={{
              id: 'newEvent',
              name: '',
              date: '',
            }}
          />
          <PrimaryButton
            isDisabled={isSubmitting}
            style={styles.addButton}
            onPress={() =>
              this.setState({
                isAddEventModalVisible: true,
              })
            }
            text={isSubmitting ? 'Logging...' : 'Log New Event'}
            type="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default AddPage;
