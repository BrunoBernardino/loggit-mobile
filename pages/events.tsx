import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  Keyboard,
  FlatList,
  Text,
} from 'react-native';

import MonthNavigation from '../components/MonthNavigation';
import Event from '../components/Event';
import EditEventModal from '../components/EditEventModal';

import * as T from '../lib/types';

interface EventsPageProps extends T.WrappedComponentProps {}
interface EventsPageState {
  filterEventName: string;
  isEditEventModalVisible: boolean;
  chosenEvent: null | T.Event;
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

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  searchInput: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    minWidth: '70%',
  },

  noEventsFound: {
    color: '#999',
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

interface NoEventsFoundProps {
  hasSearch: boolean;
}

const NoEventsFound = (props: NoEventsFoundProps): JSX.Element => {
  return (
    <>
      {props.hasSearch ? (
        <Text style={styles.noEventsFound}>
          No events found matching that search term.{'\n'}Try changing it!
        </Text>
      ) : (
        <Text style={styles.noEventsFound}>
          No events found for this month.{'\n'}Go add one!
        </Text>
      )}
    </>
  );
};

class EventsPage extends Component<EventsPageProps, EventsPageState> {
  constructor(props: EventsPageProps) {
    super(props);
    this.state = {
      filterEventName: '',
      isEditEventModalVisible: false,
      chosenEvent: null,
    };
  }

  saveEvent = async (newEvent: T.Event) => {
    const { saveEvent } = this.props;
    return saveEvent(newEvent);
  };

  deleteEvent = async (eventId: string) => {
    const { deleteEvent } = this.props;
    return deleteEvent(eventId);
  };

  render() {
    const {
      isUsingDarkMode,
      isLoading,
      events,
      monthInView,
      changeMonthInView,
      loadData,
    } = this.props;
    const {
      filterEventName,
      isEditEventModalVisible,
      chosenEvent,
    } = this.state;

    let eventsToShow = events;

    if (filterEventName) {
      eventsToShow = eventsToShow.filter((event) =>
        event.name.toLowerCase().includes(filterEventName.toLowerCase()),
      );
    }

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <MonthNavigation
            currentMonth={monthInView}
            handleChangeMonth={changeMonthInView}
          />
          <View style={styles.headerContainer} removeClippedSubviews={false}>
            <TextInput
              placeholderTextColor="#CCC"
              style={styles.searchInput}
              placeholder="Search for an event"
              onChangeText={(text) => this.setState({ filterEventName: text })}
              value={filterEventName}
              autoCapitalize="none"
              autoCompleteType="off"
              keyboardType="default"
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType="done"
            />
          </View>
          <FlatList
            refreshing={isLoading}
            onRefresh={() => loadData({ forceReload: true })}
            data={eventsToShow}
            renderItem={({ item }) => (
              <Event
                {...item}
                onPress={() =>
                  this.setState({
                    isEditEventModalVisible: true,
                    chosenEvent: item,
                  })
                }
                showDate
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <NoEventsFound hasSearch={filterEventName.length > 0} />
            }
          />
          {chosenEvent && (
            <EditEventModal
              isUsingDarkMode={isUsingDarkMode}
              isVisible={isEditEventModalVisible}
              onDismiss={() =>
                this.setState({
                  isEditEventModalVisible: false,
                  chosenEvent: null,
                })
              }
              onSaveEvent={this.saveEvent}
              onDeleteEvent={this.deleteEvent}
              event={chosenEvent}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default EventsPage;
