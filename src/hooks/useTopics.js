import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

export default function useTopics({ defaultValue = {}, setUnsavedChanges }) {
  const [topics, setTopics] = useState(defaultValue);

  function addTopic(topicName) {
    if (!topicName) return;
    if (
      !topics ||
      !Object.values(topics).find((topic) => topic.name === topicName)
    ) {
      console.log(`Adding topic with name ${topicName}`);

      const dateNow = Date.now();
      const newTopicData = {
        id: `topic-${uuidv4()}`,
        name: topicName,
        dateCreated: dateNow,
        dateModified: dateNow,
        dateDeleted: 0,
      };

      setTopics((topics) => {
        const updatedTopics = { ...topics };
        updatedTopics[newTopicData.id] = newTopicData;
        return updatedTopics;
      });

      setUnsavedChanges((unsavedChanges) => {
        const newUpdatedItems = { ...unsavedChanges };
        newUpdatedItems['topics'][newTopicData.id] = newTopicData;
        return newUpdatedItems;
      });

      return true;
    }
  }

  function deleteTopic(topicToDelete) {
    if (!topicToDelete) return;
    if (
      window.confirm(
        `Are you sure that you want to delete the topic ${topicToDelete.name}?`
      )
    ) {
      console.log(`Deleting topic ${topicToDelete.name}`);

      updateTopic({
        topicId: topicToDelete.id,
        updates: { dateDeleted: Date.now() },
      });
      return true;
    }
  }

  function updateTopic({ topicId, updates }) {
    if (!topicId || !updates || !Object.keys(updates).length) return;

    setTopics((topics) => {
      const topicToUpdate = topics[topicId];
      if (!topicToUpdate) {
        console.log(`Topic ${topicId} can't be updated. It doesn't exist`);
        return topics;
      } else {
        const updatedTopics = { ...topics };
        const updatedTopic = {
          ...topicToUpdate,
          ...updates,
          dateModified: Date.now(),
        };
        updatedTopics[topicId] = updatedTopic;

        setUnsavedChanges((unsavedChanges) => {
          const newUpdatedItems = { ...unsavedChanges };
          newUpdatedItems['topics'][topicId] = updatedTopic;
          return newUpdatedItems;
        });
        return updatedTopics;
      }
    });

    return true;
  }

  return { topics, setTopics, addTopic, deleteTopic };
}
