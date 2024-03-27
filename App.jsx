import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';

import * as Location from 'expo-location';

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [updatedLocation, setUpdatedLocation] = useState(null);
  // const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    (async () => {
      let timestamp;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      Location.watchPositionAsync({}, (locationObject) => {
        if (locationObject && timestamp === null) {
          timestamp = locationObject.timestamp;
        } else if (
          locationObject &&
          timestamp &&
          locationObject.timestamp - 2000 > timestamp
        ) {
          timestamp = locationObject.timestamp;
          setUpdatedLocation(locationObject);
        }
      });
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {updatedLocation ? (
        <>
          <Text style={styles.paragraph}>
            Latitude: {updatedLocation.coords.latitude}
          </Text>
          <Text style={styles.paragraph}>
            Longitude: {updatedLocation.coords.longitude}
          </Text>
        </>
      ) : (
        <Text>Waiting for Location</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
export default App;
