import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';

// TODO debounce
export default function useDatabaseState({
  database,
  dbPath,
  defaultValue = [],
}) {
  const [state, setState] = useState(defaultValue);
  //   () => {
  //   // console.log(`Restoring ${dbPath} from database`);
  //   // const dbRef = ref(getDatabase());
  //   // const snapshot = await get(child(dbRef, dbPath));
  //   // console.log('snapshot:', snapshot);
  //   // // .then((snapshot) => {
  //   // try {
  //   //   if (snapshot.exists()) {
  //   //     const value = snapshot.val();
  //   //     console.log('snapshot.val():', value);
  //   //     if (value) return value;
  //   //   } else {
  //   //     console.log('No data available');
  //   //   }
  //   //   // return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  //   // } catch (error) {
  //   //   console.error(error);
  //   // }
  //   return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  // });

  useEffect(() => {
    if (!dbPath || dbPath.includes('undefined')) return;
    // Subscribe to db changes
    const stateRef = ref(database, dbPath);
    const calcelSubscription = onValue(stateRef, (snapshot) => {
      // const updatedState = snapshot.val() || defaultValue;
      const updatedState = snapshot.val();
      console.log(
        `Database updated. Updating local ${dbPath}: ${JSON.stringify(
          updatedState
        )}`
      );
      setState(updatedState);
    });
    return () => {
      console.log(`Canceling subscription to ${dbPath}}`);
      calcelSubscription();
      // setState(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbPath]);

  useEffect(() => {
    if (!state || dbPath.includes('undefined')) return;
    if (JSON.stringify(state) !== JSON.stringify(defaultValue)) {
      // Update db
      const updates = {};
      updates[dbPath] = state;
      console.log(`Updating ${dbPath}: ${JSON.stringify(updates)}`);
      update(ref(database), updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, state]);

  return [state, setState];
}
