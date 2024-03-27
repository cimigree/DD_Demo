import React, { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import CheapRuler from 'cheap-ruler';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const timestampRef = useRef(Date.now());

  const calculateDistance = (cheapRuler, stateLocation, returnedLocation) => {
    let change = 0;
    if (stateLocation !== null) {
      const oldPoint = [stateLocation.longitude, stateLocation.latitude];
      const newPoint = [
        returnedLocation.coords.longitude,
        returnedLocation.coords.latitude,
      ];
      change = cheapRuler.distance(oldPoint, newPoint);
    }
    return change;
  };

  useEffect(() => {
    let positionWatcher = null;
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
      const ruler = new CheapRuler(currentLocation.coords.latitude, 'meters');
      positionWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation },
        (locationObject) => {
          if (locationObject !== null) {
            const calculatedDistance = calculateDistance(
              ruler,
              location,
              locationObject,
            );
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
        },
      );
    })();
    return () => {
      if (positionWatcher) {
        positionWatcher.remove();
      }
    };
  }, []);

  return { location, errorMsg };
};
