import React, { Component } from 'react';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  InputAccessoryView,
  Keyboard,
  Button,
  Alert,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import BasicModal from '../BasicModal';
import PrimaryButton from '../Button';

import * as T from '../../lib/types';

interface EditEventModalProps {
  isUsingDarkMode: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  onSaveEvent: (newEvent: T.Event) => Promise<boolean>;
  onDeleteEvent?: (eventId: string) => Promise<boolean>;
  event: T.Event;
}
interface EditEventModalState {
  isSubmitting: boolean;
  isDatePickerVisible: boolean;
  name: string;
  date: string;
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

  label: {
    color: '#000',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 38,
  },

  input: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 4,
  },

  inputAccessoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#efefef',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  inputButton: {
    color: '#000',
  },

  picker: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
  },

  updateButton: {
    marginTop: 68,
    marginBottom: 20,
    minHeight: 16,
  },

  deleteButton: {
    marginTop: 20,
  },
});

class EditEventModal extends Component<
  EditEventModalProps,
  EditEventModalState
> {
  inputAccessoryViewID = 'doneViewID';

  constructor(props: EditEventModalProps) {
    super(props);

    const { name, date } = props.event;

    this.state = {
      isSubmitting: false,
      isDatePickerVisible: false,
      name,
      date,
    };
  }

  onSaveEvent = async () => {
    const { onSaveEvent, onDismiss, event } = this.props;
    const { isSubmitting, name, date } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const newEvent: T.Event = {
      id: event.id,
      name,
      date,
    };

    const success = await onSaveEvent(newEvent);
    this.setState({ isSubmitting: false });

    if (success) {
      this.setState({ name: '', date: '' });
      onDismiss();
    }
  };

  requestEventDelete = () => {
    const { event, onDismiss, onDeleteEvent } = this.props;

    if (event.id === 'newEvent' || !onDeleteEvent) {
      return;
    }

    Alert.alert(
      'Are you sure?',
      'Are you sure you want to delete this event?\nThis action is irreversible.',
      [
        {
          text: 'No, cancel.',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes!',
          onPress: async () => {
            this.setState({ isSubmitting: true });
            const success = await onDeleteEvent(event.id);
            this.setState({ isSubmitting: false });

            if (success) {
              onDismiss();
            }
          },
          style: 'destructive',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  InputAccessoryView() {
    return (
      <InputAccessoryView nativeID={this.inputAccessoryViewID}>
        <View style={styles.inputAccessoryContainer}>
          <Button
            color={styles.inputButton.color}
            onPress={() => Keyboard.dismiss()}
            title="Cancel"
          />
          <Button
            color={styles.inputButton.color}
            onPress={() => Keyboard.dismiss()}
            title="Done"
          />
        </View>
      </InputAccessoryView>
    );
  }

  render() {
    const { event, isUsingDarkMode, isVisible, onDismiss } = this.props;
    const { isSubmitting, isDatePickerVisible, name, date } = this.state;

    return (
      <BasicModal
        isVisible={isVisible}
        isSubmitting={isSubmitting}
        onDismiss={onDismiss}
        onConfirm={this.onSaveEvent}
      >
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholderTextColor="#CCC"
          style={styles.input}
          placeholder="Volunteering"
          onChangeText={(text) => this.setState({ name: text })}
          value={name}
          onSubmitEditing={() => Keyboard.dismiss()}
          returnKeyType="done"
        />

        <Text style={styles.label}>Date</Text>
        {!isDatePickerVisible && (
          <TextInput
            placeholderTextColor="#CCC"
            style={styles.input}
            placeholder="Today"
            value={date ? moment(date, 'YYYY-MM-DD').format('D MMMM YYYY') : ''}
            onFocus={() => this.setState({ isDatePickerVisible: true })}
          />
        )}
        <DateTimePickerModal
          isDarkModeEnabled={isUsingDarkMode}
          isVisible={isDatePickerVisible}
          date={date ? moment(date, 'YYYY-MM-DD').toDate() : new Date()}
          mode="date"
          onCancel={() => this.setState({ isDatePickerVisible: false })}
          onConfirm={(chosenDate: Date) => {
            this.setState({
              isDatePickerVisible: false,
              date: moment(chosenDate).format('YYYY-MM-DD'),
            });
          }}
        />

        {event.id === 'newEvent' ? (
          <PrimaryButton
            style={styles.updateButton}
            type="primary"
            text={isSubmitting ? 'Logging...' : 'Log Event'}
            onPress={this.onSaveEvent}
          />
        ) : (
          <PrimaryButton
            style={styles.updateButton}
            type="primary"
            text={isSubmitting ? 'Saving...' : 'Save Event'}
            onPress={this.onSaveEvent}
          />
        )}

        {event.id !== 'newEvent' && (
          <PrimaryButton
            style={styles.deleteButton}
            type="delete"
            text="Delete Event"
            onPress={this.requestEventDelete}
          />
        )}

        {Platform.OS === 'ios' ? this.InputAccessoryView() : null}
      </BasicModal>
    );
  }
}

export default EditEventModal;
