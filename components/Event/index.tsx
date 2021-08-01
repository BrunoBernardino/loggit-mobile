import React from 'react';
import moment from 'moment';
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';

import * as T from '../../lib/types';

interface EventProps extends T.Event {
  onPress: () => void;
  showDate: boolean;
}

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Platform.OS === 'android' ? 3 : 12,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 8,
    borderWidth: Platform.OS === 'android' ? 0.1 : 0,
  },

  datelessContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#430426',
  },

  name: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    flex: 1,
  },

  datelessName: {
    textAlign: 'center',
    color: '#430426',
  },

  date: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
});

const Event = (props: EventProps): JSX.Element => {
  const eventDate = moment(props.date, 'YYYY-MM-DD');
  return (
    <TouchableOpacity
      style={
        props.showDate
          ? styles.container
          : [styles.container, styles.datelessContainer]
      }
      onPress={props.onPress}
    >
      <Text
        style={
          props.showDate ? styles.name : [styles.name, styles.datelessName]
        }
        numberOfLines={2}
      >
        {props.name}
      </Text>
      {props.showDate ? (
        <Text style={styles.date}>{eventDate.format('DD MMM')}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default Event;
