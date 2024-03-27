import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

import * as Location from 'expo-location';
import CheapRuler from 'cheap-ruler';

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const timestampRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      let calculatedDistance = 0;
      const ruler = new CheapRuler(currentLocation.coords.latitude, 'meters');
      Location.watchPositionAsync({}, (locationObject) => {
        if (locationObject !== null) {
          if (location !== null) {
            const oldPoint = [location.longitude, location.latitude];
            const newPoint = [
              locationObject.coords.longitude,
              locationObject.coords.latitude,
            ];
            calculatedDistance = ruler.distance(oldPoint, newPoint);
          }
          if (
            locationObject.timestamp - timestampRef.current > 2000 ||
            calculatedDistance > 15
          ) {
            setLocation((prevState) => ({
              ...prevState,
              latitude: locationObject.coords.latitude,
              longitude: locationObject.coords.longitude,
            }));
            timestampRef.current = locationObject.timestamp;
          }
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
      {location ? (
        <>
          <Text style={styles.paragraph}>Latitude: {location.latitude}</Text>
          <Text style={styles.paragraph}>Longitude: {location.longitude}</Text>
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
