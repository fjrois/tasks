import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
// import { useList, useListVals } from 'react-firebase-hooks/database';

export default function useDatabaseState({
  database,
  dbPath,
  debounce,
  defaultValue = [],
  skipDatabaseUse,
}) {
  const [state, setState] = useState(defaultValue);
  // const [values, loading, error] = useListVals(ref(database, dbPath));
  // if (!loading && !error) {
  //   console.log(`values ${dbPath}:`, values);
  // }

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

  function updateList(updatedList) {
    if (!updatedList || dbPath.includes('undefined')) return;
    const list =
      typeof updatedList !== 'function' ? updatedList : updatedList(state);
    if (JSON.stringify(list) !== JSON.stringify(defaultValue)) {
      function updateDb() {
        const updates = {};
        updates[dbPath] = list;
        console.log(`Updating ${dbPath}: ${JSON.stringify(updates)}`);
        update(ref(database), updates);
      }
      if (debounce) {
        const debounceMs = typeof debounce === 'number' ? debounce : 1000;
        const timeoutId = setTimeout(() => {
          updateDb();
        }, debounceMs);
        return () => clearTimeout(timeoutId);
      } else {
        updateDb();
      }
    }
  }

  // useEffect(() => {
  //   if (skipDatabaseUse) return;
  //   if (!state || dbPath.includes('undefined')) return;
  //   if (JSON.stringify(state) !== JSON.stringify(defaultValue)) {
  //     function updateDb() {
  //       const updates = {};
  //       updates[dbPath] = state;
  //       console.log(`Updating ${dbPath}: ${JSON.stringify(updates)}`);
  //       update(ref(database), updates);
  //     }
  //     if (debounce) {
  //       const debounceMs = typeof debounce === 'number' ? debounce : 1000;
  //       const timeoutId = setTimeout(() => {
  //         updateDb();
  //       }, debounceMs);
  //       return () => clearTimeout(timeoutId);
  //     } else {
  //       updateDb();
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debounce, database, state]);

  useEffect(() => {
    if (skipDatabaseUse) return;
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
      setState(0);
      // setState(null);
    };
  }, [database, dbPath, skipDatabaseUse]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // return [state, setState];
  // return [values, updateList];
  return [state, updateList];
}
