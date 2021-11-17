import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  collection,
  // deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  // updateDoc,
  where,
} from 'firebase/firestore';
import config from '../config';

const { firebase: firebaseConfig } = config;
const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore(firebaseApp);

// GENERAL
export async function getItems({ collectionName, filters, userId }) {
  if (!collectionName || !userId) return;

  const formattedFilters = [];
  if (filters && Object.keys(filters).length) {
    for (const filterProperty in filters) {
      formattedFilters.push(
        where(filterProperty, '==', String(filters[filterProperty]))
      );
    }
  }

  const path = `users/${userId}/${collectionName}`;
  const ref = collection(database, path);
  const nonDeletedFilter = [where('dateDeleted', '==', 0)];
  const q = query(ref, ...nonDeletedFilter, ...formattedFilters);
  try {
    const querySnapshot = await getDocs(q);
    const dbItems = {};
    querySnapshot.forEach((doc) => {
      dbItems[doc.id] = doc.data();
    });
    return dbItems;
  } catch (err) {
    throw err;
  }
}

export function setItem({ collectionName, itemId, item, userId }) {
  console.log(`setItem, collection ${collectionName}`);
  console.log('setItem itemId:', itemId);
  if (!collectionName || !itemId || !item || !userId) return;

  const path = `users/${userId}/${collectionName}/${itemId}`;
  const ref = doc(database, path);
  setDoc(ref, item)
    .then(() => {
      console.log('setItem success');
    })
    .catch((err) => {
      console.log('setItem err:', err);
    });
}

// PANELS
// function addPanel() {}
// function deletePanel() {}
// function updatePanel() {}

export async function getPanels({ filters, userId }) {
  return getItems({ collectionName: 'panels', filters, userId });
}

export function setPanel({ panelId, panel, userId }) {
  return setItem({
    collectionName: 'panels',
    itemId: panelId,
    item: panel,
    userId,
  });
}

// TOPICS
// function deleteTopic() {}
// export function updateTopic() {}

export async function getTopics({ filters, userId }) {
  return getItems({ collectionName: 'topics', filters, userId });
}

export function setTopic({ topicId, topic, userId }) {
  return setItem({
    collectionName: 'topics',
    itemId: topicId,
    item: topic,
    userId,
  });
}

// TASKS
// function deleteTask() {}
// function updateTask() {}

export async function getTasks({ filters, userId }) {
  return getItems({ collectionName: 'tasks', filters, userId });
}

export function setTask({ taskId, task, userId }) {
  return setItem({
    collectionName: 'tasks',
    itemId: taskId,
    item: task,
    userId,
  });
}
