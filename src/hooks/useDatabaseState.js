import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';

// TODO debounce
export default function useDatabaseState({
  database,
  dbPath,
  defaultValue = {},
}) {
  const [state, setState] = useState(() => {
    // console.log(`Restoring ${dbPath} from database`);
    // const dbRef = ref(getDatabase());
    // const snapshot = await get(child(dbRef, dbPath));
    // console.log('snapshot:', snapshot);
    // // .then((snapshot) => {
    // try {
    //   if (snapshot.exists()) {
    //     const value = snapshot.val();
    //     console.log('snapshot.val():', value);
    //     if (value) return value;
    //   } else {
    //     console.log('No data available');
    //   }
    //   // return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    // } catch (error) {
    //   console.error(error);
    // }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    if (state && JSON.stringify(state) !== JSON.stringify(defaultValue)) {
      // Update db
      const updates = {};
      updates[dbPath] = state;
      console.log(`Updating ${dbPath}: ${JSON.stringify(updates)}`);
      update(ref(database), updates);
    }
  }, [database, dbPath, defaultValue, state]);

  useEffect(() => {
    // Subscribe to db changes
    const stateRef = ref(database, dbPath);
    onValue(stateRef, (snapshot) => {
      const updatedState = snapshot.val() || defaultValue;
      console.log(
        `Database updated. Updating local ${dbPath}: ${JSON.stringify(
          updatedState
        )}`
      );
      setState(updatedState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [state, setState];
}