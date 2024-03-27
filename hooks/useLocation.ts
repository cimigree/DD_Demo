import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import CheapRuler from 'cheap-ruler';

type LocationObject = {
  latitude: number;
  longitude: number;
};

type Nullable<T> = T | null;

export const useLocation = () => {
  const [location, setLocation] = useState<Nullable<LocationObject>>(null);
  const [errorMsg, setErrorMsg] = useState<Nullable<string>>(null);
  const timestampRef = useRef<number>(Date.now());

  const calculateDistance = (
    cheapRuler: CheapRuler,
    stateLocation: Nullable<LocationObject>,
    returnedLocation: Location.LocationObject,
  ): number => {
    let change = 0;
    if (stateLocation !== null) {
      const oldPoint: [number, number] = [
        stateLocation.longitude,
        stateLocation.latitude,
      ];
      const newPoint: [number, number] = [
        returnedLocation.coords.longitude,
        returnedLocation.coords.latitude,
      ];
      change = cheapRuler.distance(oldPoint, newPoint);
    }
    return change;
  };

  useEffect(() => {
    let positionWatcher: Location.LocationSubscription | null = null;
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