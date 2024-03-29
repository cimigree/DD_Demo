import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useLocation } from './hooks/useLocation';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location?: Location;
  errorMsg?: string;
}

const App: React.FC = () => {
  const { location, errorMsg } = useLocation();
  if (errorMsg) {
    return (
      <View>
        <Text>{errorMsg}</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {location ? (
          <>
            <Text style={styles.paragraph}>Lat: {location['latitude']}</Text>
            <Text style={styles.paragraph}>Lon: {location['longitude']}</Text>
          </>
        ) : (
          <Text>Waiting for Location</Text>
        )}
      </View>
    );
  }
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
