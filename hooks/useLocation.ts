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
  const latitudeRef = useRef<number>(0);
  const longitudeRef = useRef<number>(0);

  const calculateDistance = (
    cheapRuler: CheapRuler,
    returnedLocation: Location.LocationObject,
  ): number => {
    let change = 0;
    const oldPoint: [number, number] = [
      longitudeRef.current,
      latitudeRef.current,
    ];
    const newPoint: [number, number] = [
      returnedLocation.coords.longitude,
      returnedLocation.coords.latitude,
    ];
    change = cheapRuler.distance(oldPoint, newPoint);
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
            const calculatedDistance = calculateDistance(ruler, locationObject);
            if (
              locationObject.timestamp - timestampRef.current >= 2000 ||
              calculatedDistance > 15
            ) {
              setLocation({
                latitude: locationObject.coords.latitude,
                longitude: locationObject.coords.longitude,
              });
              timestampRef.current = locationObject.timestamp;
              latitudeRef.current = locationObject.coords.latitude;
              longitudeRef.current = locationObject.coords.longitude;
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
