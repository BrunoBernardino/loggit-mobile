import React from 'react';
import moment from 'moment';
import { StyleSheet, Text, View, Platform } from 'react-native';

interface EventStatProps {
  name: string;
  frequency: string;
  lastDate: string;
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

  name: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    flex: 1,
  },

  frequency: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'center',
    flex: 1,
  },

  lastDate: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
});

const EventStat = (props: EventStatProps): JSX.Element => {
  const eventDate = moment(props.lastDate, 'YYYY-MM-DD');
  return (
    <View style={styles.container}>
      <Text style={styles.name} numberOfLines={2}>
        {props.name}
      </Text>
      <Text style={styles.frequency}>{props.frequency}</Text>
      <Text style={styles.lastDate}>{eventDate.format('DD MMM')}</Text>
    </View>
  );
};

export default EventStat;
