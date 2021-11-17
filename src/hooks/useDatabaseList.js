import { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export default function useDatabaseList({
  database,
  defaultValue = [],
  filters,
  path,
}) {
  const [listObject, setListObject] = useState(defaultValue);

  const filtersRef = useRef({});
  const pathRef = useRef('');
  useEffect(() => {
    if (
      (filters &&
        JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) ||
      (path && pathRef.current !== path)
    ) {
      console.log('filters changed: fetching...');
      fetch();
      filtersRef.current = filters;
      pathRef.current = path;
      // return () => {
      //   setListObject({});
      // };
    }
  }, [filters, path]);

  function fetch() {
    console.log('fetch');
    setListObject({});
    const formattedFilters = [];
    if (filters) {
      for (const filterProperty in filters) {
        formattedFilters.push(
          where(filterProperty, '==', String(filters[filterProperty]))
        );
      }
      // formattedFilters.push(where('panelId', '==', '2'));
    }
    // console.log('fetch pathAndFilters:', pathAndFilters);
    const ref = collection(database, path);
    // const q = query(collection(db, 'cities'), where('capital', '==', true));
    // const x = [where('panelId', '==', '2')];
    const q = query(ref, ...formattedFilters);
    // getDocs(ref)
    getDocs(q)
      .then((querySnapshot) => {
        // console.log('HERE typeof querySnapshot:', typeof querySnapshot);
        // console.log('HERE querySnapshot:', querySnapshot.data());
        const updatedListObject = {};
        querySnapshot.forEach((doc) => {
          // console.log(`HERE ${doc.id} => ${JSON.stringify(doc.data())}`);
          // list.push(doc.data());
          updatedListObject[doc.id] = doc.data();
        });
        console.log('HERE updatedListObject:', updatedListObject);

        setListObject(updatedListObject);
      })
      .catch((err) => {
        console.log('fetch err:', err);
      });
  }

  // TODO: prevent item overwrite when it previously exists
  function addItem(newItem, rejectDuplicatesProp, addToLocalToo) {
    console.log('addItem');

    if (!rejectDuplicatesProp) {
      setItem(newItem, addToLocalToo);
    } else {
      const ref = collection(database, path);
      // Check if item exists in db
      const q = query(
        ref,
        where(rejectDuplicatesProp, '==', newItem[rejectDuplicatesProp])
      );
      getDocs(q)
        .then((querySnapshot) => {
          console.log('querySnapshot:', querySnapshot);
          console.log('querySnapshot.length:', querySnapshot.length);

          const queryResults = {};
          querySnapshot.forEach((doc) => {
            // console.log(`HERE ${doc.id} => ${JSON.stringify(doc.data())}`);
            // list.push(doc.data());
            queryResults[doc.id] = doc.data();
          });
          if (Object.keys(queryResults).length > 0) {
            console.log(
              `Can't add item. There is already an item with ${rejectDuplicatesProp} ${newItem[rejectDuplicatesProp]}`
            );
          } else {
            console.log('querySnapshot:', querySnapshot);
            setItem(newItem, addToLocalToo);
          }
        })
        .catch((err) => {
          console.log('addItem fetch err:', err);
        });
    }
  }

  function setItem(newItem, addToLocalToo) {
    console.log('setItem');
    // console.log('setItem newItem:', newItem);
    // console.log('setItem path:', path);
    // console.log('setItem newItem.id:', newItem.id);
    // const updatedPath = `${path}/${newItem.id}`;

    if (addToLocalToo) {
      // Add locally as well, for performance
      setListObject((listObject) => {
        const updatedListObject = { ...listObject };
        updatedListObject[newItem?.id] = newItem;
        return updatedListObject;
      });
    }

    // Add to database doc
    const ref = doc(database, path, newItem.id);

    setDoc(ref, newItem)
      .then(() => {
        fetch();
      })
      .catch((err) => {
        console.log('setItem err:', err);
      });
  }

  function updateItem(itemToUpdate, updates, updateLocalToo) {
    if (!updates || !Object.keys(updates).length) return;
    console.log('updateItem');

    if (updateLocalToo) {
      // Local update, for performance
      const foundItem = listObject[itemToUpdate?.id];
      if (foundItem) {
        setListObject((listObject) => {
          const updatedListObject = { ...listObject };
          const updatedItem = { ...itemToUpdate, ...updates };
          updatedListObject[itemToUpdate.id] = updatedItem;
          return updatedListObject;
        });
      }
    }

    // Database update
    const ref = doc(database, path, itemToUpdate.id);
    updateDoc(ref, updates)
      .then(() => {
        fetch();
      })
      .catch((err) => {
        console.log('updateItem err:', err);
      });
  }

  function deleteItem(itemToDelete) {
    console.log('deleteItem');

    const ref = doc(database, path, itemToDelete.id);
    deleteDoc(ref)
      .then(() => {
        fetch();
      })
      .catch((err) => {
        console.log('deleteItem err:', err);
      });
  }

  return {
    list: Object.values(listObject),
    fetch,
    addItem,
    updateItem,
    deleteItem,
  };
}
