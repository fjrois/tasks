import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

export default function useTasks({
  defaultValue = {},
  panelsList,
  selectedTab,
  setUnsavedChanges,
}) {
  const [tasks, setTasks] = useState(defaultValue);

  // TASK OPERATIONS
  function addTask(taskTitle, topic, panelId) {
    const foundTask =
      tasks &&
      Object.values(tasks).find((task) => {
        return !task.dateDeleted && task.title === taskTitle;
      });

    if (foundTask) {
      console.log(
        `There is already a task with the title ${taskTitle} (id ${foundTask.id})`
      );
      return false;
    } else {
      setTasks((tasks) => {
        console.log(`Adding task ${taskTitle}`);

        const dateNow = Date.now();
        const newTaskData = {
          dateCreated: dateNow,
          dateModified: dateNow,
          dateDeleted: 0,
          id: uuidv4(),
          status: 'todo',
          title: taskTitle,
          topic: topic || null,
          panelId,
        };
        console.log('newTaskData:', newTaskData);

        const updatedTasks = { ...tasks };
        updatedTasks[newTaskData.id] = newTaskData;

        setUnsavedChanges((unsavedChanges) => {
          const newUpdatedItems = { ...unsavedChanges };
          newUpdatedItems['tasks'][newTaskData.id] = newTaskData;
          return newUpdatedItems;
        });

        return updatedTasks;
      });
      return true;
    }
  }

  function deleteTask(taskToDelete) {
    if (!taskToDelete) return;
    console.log(`Deleting task "${taskToDelete.title}" (${taskToDelete.id})`);

    updateTask({
      taskId: taskToDelete.id,
      updates: { dateDeleted: Date.now() },
    });

    return true;
  }

  function updateTask({ taskId, updates }) {
    if (!taskId || !updates || !Object.keys(updates).length) return;

    console.log(`Updating task "${taskId}": ${JSON.stringify(updates)}`);

    setTasks((tasks) => {
      const taskToUpdate = tasks[taskId];
      if (!taskToUpdate) {
        console.log(`Task ${taskId} can't be updated. It doesn't exist`);
        return tasks;
      } else {
        const updatedTasks = { ...tasks };
        const updatedTask = {
          ...taskToUpdate,
          ...updates,
          dateModified: Date.now(),
        };
        updatedTasks[taskId] = updatedTask;

        setUnsavedChanges((unsavedChanges) => {
          const newUpdatedItems = { ...unsavedChanges };
          newUpdatedItems['tasks'][taskId] = updatedTask;
          return newUpdatedItems;
        });
        return updatedTasks;
      }
    });
    return true;
  }

  function moveTaskToPanel({ task: taskToMove, destinationPanel }) {
    if (!taskToMove || !destinationPanel) return;

    let panelId;
    switch (destinationPanel) {
      case 'next':
        panelId = panelsList[selectedTab + 1]?.id;
        break;
      case 'none':
        panelId = null;
        break;
      case 'previous':
        panelId = panelsList[selectedTab - 1]?.id;
        break;
      case 'selected':
        if (selectedTab && panelsList[selectedTab]) {
          panelId = panelsList[selectedTab]?.id;
        }
        break;
      default:
        break;
    }
    if (!panelId && destinationPanel !== 'none') {
      console.log(
        `Invalid moveTaskToPanel destinationPanel: ${destinationPanel}`
      );
      return;
    }

    console.log(`Moving task to ${destinationPanel} panel, with id ${panelId}`);

    updateTask({
      taskId: taskToMove.id,
      updates: {
        panelId,
      },
    });
  }

  return { tasks, setTasks, addTask, deleteTask, updateTask, moveTaskToPanel };
}
