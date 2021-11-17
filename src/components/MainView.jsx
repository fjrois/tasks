import { v4 as uuidv4 } from 'uuid';
import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import Panel from './Panel.jsx';
import PanelTabs from './PanelTabs.jsx';
import SaveButton from './SaveButton';

import * as database from '../database/firebase.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js';

export default function MainView({ login, loginEmailSent, logout, user }) {
  const [unsavedChanges, setUnsavedChanges] = useState({
    panels: {},
    tasks: {},
    topics: {},
  });

  const [saveStatus, setSaveStatus] = useState('up-to-date'); // "up-to-date", "unsaved-changes", "saving" or "failed-to-save"

  const [allTasksView, setAllTasksView] = useState(false);

  const [selectedTab, setSelectedTab] = useLocalStorageState({
    // defaultValue: 0,
    key: `tasks:selected-tab`,
  });

  const [panels, setPanels] = useState({});
  const panelsList = useMemo(() => {
    if (!panels) return [];
    console.log('Recalculating panelsList...');
    const newValue = objectToList(panels).sort(
      (panel1, panel2) => panel1.dateCreated - panel2.dateCreated
    );
    console.log('panelsList newValue:', newValue);
    return newValue;
  }, [panels]);

  const [confettiedPanels, setConfettiedPanels] = useLocalStorageState({
    defaultValue: [],
    key: `tasks:confettied-panels`,
  });

  const [topics, setTopics] = useState([]);

  const [tasks, setTasks] = useState([]);

  // Load lists from db on first render
  useEffect(() => {
    if (user) {
      // panels
      database
        .getPanels({ filters: {}, userId: user?.uid })
        .then((dbPanels) => {
          setPanels(dbPanels);
          setSelectedTab((selectedTab) => selectedTab);
        })
        .catch((err) => console.log(err));

      // topics
      database
        .getTopics({ filters: {}, userId: user?.uid })
        .then((dbTopics) => {
          setTopics(dbTopics);
        })
        .catch((err) => console.log(err));

      // tasks
      database
        .getTasks({ filters: {}, userId: user?.uid })
        .then((dbTasks) => {
          console.log('dbTasks:', dbTasks);
          setTasks(dbTasks);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  // Alert on unsaved changes and unloading page
  useEffect(() => {
    const beforeUnloadListener = (event) => {
      event.preventDefault();
      if (unsavedChangedExist(unsavedChanges)) {
        return (event.returnValue = 'Are you sure that you want to exit?');
      }
    };

    window.addEventListener('beforeunload', beforeUnloadListener, {
      capture: true,
    });
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      });
    };
  }, [unsavedChanges]);

  const unsavedChangesRef = useRef(unsavedChanges);
  useEffect(() => {
    unsavedChangesRef.current = unsavedChanges;
  }, [unsavedChanges]);

  // Check if there is any unsaved work
  useEffect(() => {
    if (unsavedChangedExist(unsavedChanges)) {
      setSaveStatus('unsaved-changes');
    }
  }, [unsavedChanges]);

  // Set interval to perform updates on db where needed
  useEffect(() => {
    const intervalId = setInterval(saveData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!user) {
      // Save anonymous user data in localStorage
      if (panels && Object.keys(panels).length > 0) {
        window.localStorage.setItem(
          'tasks:anonymous-panels',
          JSON.stringify(panels)
        );
      }
      if (tasks && Object.keys(tasks).length > 0) {
        window.localStorage.setItem(
          'tasks:anonymous-tasks-list',
          JSON.stringify(tasks)
        );
      }
      if (topics && Object.keys(topics).length > 0) {
        window.localStorage.setItem(
          'tasks:anonymous-topics-list',
          JSON.stringify(topics)
        );
      }
    }
  }, [panels, tasks, topics, user]);

  // TODO: UPDATE THIS
  useEffect(() => {
    if (user) {
      const isFirstTimeUserResult = isFirstTimeUser(user);
      if (isFirstTimeUserResult) {
        // Load user data that was previously anonymous
        const { panels, tasks, topics } = getLocalStorageAnonymousLists();

        if (panels) setPanels(panels);
        if (tasks) setTasks(tasks);
        if (topics) setTopics(topics);
      }
    }
    return () => {
      if (user) {
        clearLocalStorageAnonymousLists();
      }
    };
    // }, [setPanelsList, setTasks, setTopics, user]);
  }, [user]);

  // PANEL OPERATIONS

  // TODO: adapt this logic to new db operations
  // function updatePanelMetadata({ panelId, updates }) {
  // const { progress } = updates;
  // setPanelsList((panelsList) => {
  //   const foundPanelIndex = panelsList.findIndex(
  //     (panel) => panel.id === panelId
  //   );
  //   const foundPanelData = panelsList[foundPanelIndex];
  //   const updatedPanel = { ...foundPanelData };
  //   updatedPanel.progress = progress;
  //   const updatedPanelList = [...panelsList];
  //   // updatedPanelList[foundPanelIndex].progress = progress;
  //   updatedPanelList[foundPanelIndex] = updatedPanel;
  //   return updatedPanelList;
  // });
  // }

  function addPanel(panelName, panelData) {
    if (
      panels &&
      Object.values(panels).find(
        (panel) => panel.name.toLowerCase() === panelName.toLowerCase()
      )
    ) {
      console.log(`There is already a panel with the name ${panelName}`);
    } else {
      console.log(`Adding panel ${panelName}`);

      const dateNow = Date.now();
      let newPanelMetadata = {
        id: `panel-${uuidv4()}`,
        name: panelName,
        progress: { real: 0, potential: 0 },
        dateCreated: dateNow,
        dateCreated: dateNow,
        dateDeleted: 0,
      };

      // Use panel data if provided as argument
      if (panelData) {
        newPanelMetadata = { ...newPanelMetadata, ...panelData };
      }

      setPanels((panels) => {
        const updatedPanels = { ...panels };
        updatedPanels[newPanelMetadata.id] = newPanelMetadata;
        return updatedPanels;
      });
      setUnsavedChanges((unsavedChanges) => {
        const newUpdatedItems = { ...unsavedChanges };
        newUpdatedItems['panels'][newPanelMetadata.id] = newPanelMetadata;
        return newUpdatedItems;
      });
      return true;
    }
  }

  function deletePanel(panelToDelete) {
    if (
      window.confirm(
        `Are you sure that you want to delete panel ${panelToDelete.name}?`
      )
    ) {
      console.log(`Deleting panel ${panelToDelete.name} (${panelToDelete.id})`);

      if (panelsList.length > 1 && selectedTab > 0) {
        setSelectedTab(selectedTab - 1);
      }

      updatePanel({
        panelId: panelToDelete.id,
        updates: { dateDeleted: Date.now() },
      });
      setConfettiedPanels((confettiedPanels) =>
        confettiedPanels.filter((panelId) => panelId !== panelToDelete.id)
      );
    }
    return true;
  }

  function updatePanel({ panelId, updates }) {
    if (!panelId || !updates || !Object.keys(updates).length) return;

    setPanels((panels) => {
      const panelToUpdate = panels[panelId];
      if (!panelToUpdate) {
        console.log(`Panel ${panelId} can't be updated. It doesn't exist`);
        return panels;
      } else {
        const updatedPanels = { ...panels };
        const updatedPanel = {
          ...panelToUpdate,
          ...updates,
          dateModified: Date.now(),
        };
        updatedPanels[panelId] = updatedPanel;

        setUnsavedChanges((unsavedChanges) => {
          const newUpdatedItems = { ...unsavedChanges };
          newUpdatedItems['panels'][panelId] = updatedPanel;
          return newUpdatedItems;
        });
        return updatedPanels;
      }
    });
    return true;
  }

  // TOPIC OPERATIONS
  function addTopic(topicName) {
    if (!topicName) return;
    if (
      !topics ||
      !Object.values(topics).find((topic) => topic.name === topicName)
    ) {
      console.log(`Adding topic with name ${topicName}`);

      const dateNow = Date.now();
      const newTopicData = {
        dateCreated: dateNow,
        dateDeleted: 0,
        dateModified: dateNow,
        id: `topic-${uuidv4()}`,
        name: topicName,
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

  async function saveData() {
    console.log('Checking if any changes to save...');
    const {
      panels: panelsToUpdate,
      tasks: tasksToUpdate,
      topics: topicsToUpdate,
    } = unsavedChangesRef.current;
    let remainingPanels = { ...panelsToUpdate };
    let remainingTasks = { ...tasksToUpdate };
    let remainingTopics = { ...topicsToUpdate };

    if (panelsToUpdate && Object.keys(panelsToUpdate).length > 0) {
      if (saveStatus !== 'saving') setSaveStatus('saving');
      // set updated panels
      console.log('panels require syncup');
      console.log('panelsToUpdate:', panelsToUpdate);
      for (const panelId in panelsToUpdate) {
        const panel = panelsToUpdate[panelId];
        console.log('panel:', panel);
        try {
          await database.setPanel({ panelId, panel, userId: user?.uid });
          delete remainingPanels[panelId];
        } catch (err) {
          console.log(`Error updating panel ${panelId}:`, err);
        }
      }
    } else if (tasksToUpdate && Object.keys(tasksToUpdate).length > 0) {
      if (saveStatus !== 'saving') setSaveStatus('saving');
      // set updated tasks
      for (const taskId in tasksToUpdate) {
        const task = tasksToUpdate[taskId];
        try {
          await database.setTask({ taskId, task, userId: user?.uid });
          delete remainingTasks[taskId];
        } catch (err) {
          console.log(`Error updating task ${taskId}:`, err);
        }
      }
    } else if (topicsToUpdate && Object.keys(topicsToUpdate).length > 0) {
      if (saveStatus !== 'saving') setSaveStatus('saving');
      // set updated topics
      console.log('topics require syncup');
      console.log('topicsToUpdate:', topicsToUpdate);
      for (const topicId in topicsToUpdate) {
        const topic = topicsToUpdate[topicId];
        console.log('topic:', topic);
        try {
          await database.setTopic({ topicId, topic, userId: user?.uid });
          delete remainingTopics[topicId];
        } catch (err) {
          console.log(`Error updating topic ${topicId}:`, err);
        }
      }
    } else {
      console.log('Nothing to update');
    }

    if (
      Object.keys(remainingPanels).length ||
      Object.keys(remainingTasks).length ||
      Object.keys(remainingTopics).length
    ) {
      setTimeout(() => {
        setSaveStatus('failed-to-save');
      }, 1200);
    } else {
      setTimeout(() => {
        setSaveStatus('up-to-date');
      }, 1200);
    }

    const remainingItems = {
      panels: remainingPanels,
      tasks: remainingTasks,
      topics: remainingTopics,
    };
    console.log('Remaining items:', JSON.stringify(remainingItems, null, 4));
    setUnsavedChanges(remainingItems);
  }

  return (
    <Container maxWidth="md">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
      <Box display="flex" justifyContent="flex-end" marginTop="2px">
        <Box
          color="rgb(102,102,102)"
          fontSize="15px"
          marginTop="4px"
          marginRight="4px"
        >
          {user
            ? `Logged in as ${user?.email}`
            : loginEmailSent
            ? `Login email sent to ${loginEmailSent}`
            : `Log in to save your data`}
        </Box>
        {user ? (
          <>
            <Button onClick={logout} size="small">
              Logout
            </Button>
            <Box
              sx={{
                // m: 1,
                position: 'relative',
              }}
            >
              <SaveButton saveData={saveData} saveStatus={saveStatus} />
            </Box>
          </>
        ) : (
          <Button
            disabled={Boolean(loginEmailSent)}
            onClick={() => {
              const anonymousUserDataToSave = {
                panels,
                tasks,
                topics,
              };
              login(anonymousUserDataToSave);
            }}
            size="small"
          >
            Login
          </Button>
        )}
      </Box>
      {loginEmailSent ? null : (
        <>
          <PanelTabs
            addPanel={addPanel}
            allTasksView={allTasksView}
            deletePanel={deletePanel}
            panelsList={panelsList.filter((panel) => !panel.dateDeleted)}
            selectedTab={selectedTab}
            setAllTasksView={setAllTasksView}
            setSelectedTab={setSelectedTab}
            userId={user?.uid}
          />
          {panels && panelsList[selectedTab] ? (
            <Panel
              addTask={addTask}
              addTopic={addTopic}
              allTasksView={allTasksView}
              confettiedPanels={confettiedPanels}
              deleteTask={deleteTask}
              deleteTopic={deleteTopic}
              moveTaskToNextPanel={
                panelsList && selectedTab && panelsList.length > selectedTab + 1
                  ? (task) =>
                      moveTaskToPanel({ task, destinationPanel: 'next' })
                  : null
              }
              moveTaskToPreviousPanel={(task) =>
                panelsList && selectedTab && panelsList.length > selectedTab - 1
                  ? moveTaskToPanel({ task, destinationPanel: 'previous' })
                  : null
              }
              moveTaskToSelectedPanel={
                selectedTab && panelsList[selectedTab]
                  ? (task) =>
                      moveTaskToPanel({ task, destinationPanel: 'selected' })
                  : null
              }
              removeTaskFromPanel={
                selectedTab && panelsList[selectedTab]
                  ? (task) =>
                      moveTaskToPanel({ task, destinationPanel: 'none' })
                  : null
              }
              panelData={panelsList[selectedTab]}
              setConfettiedPanels={setConfettiedPanels}
              tasksList={objectToList(tasks)
                .filter((task) => !task.dateDeleted)
                .sort(
                  (task1, task2) => task1.dateModified - task2.dateModified
                )}
              topicsList={objectToList(topics)
                .filter((topic) => !topic.dateDeleted)
                .sort(
                  (topic1, topic2) => topic1.dateCreated - topic2.dateCreated
                )}
              updatePanelMetadata={
                () => {}
                // allTasksView
                //   ? () => {}
                //   : (updates) =>
                //       updatePanelMetadata({
                //         panelId: panelsList[selectedTab].id,
                //         updates,
                //       })
              }
              updateTask={updateTask}
              userId={user?.uid}
            />
          ) : null}
        </>
      )}
    </Container>
  );
}

function clearLocalStorageAnonymousLists() {
  window.localStorage.removeItem('tasks:anonymous-panels');
  window.localStorage.removeItem('tasks:anonymous-tasks-list');
  window.localStorage.removeItem('tasks:anonymous-topics-list');
}

function getLocalStorageAnonymousLists() {
  const panels = JSON.parse(
    window.localStorage.getItem('tasks:anonymous-panels')
  );
  const tasks = JSON.parse(
    window.localStorage.getItem('tasks:anonymous-tasks-list')
  );
  const topics = JSON.parse(
    window.localStorage.getItem('tasks:anonymous-topics-list')
  );

  return { panels, tasks, topics };
}

function isFirstTimeUser(user) {
  if (!user?.metadata) return false;
  const { createdAt, lastLoginAt } = user.metadata;
  return Math.abs(createdAt - lastLoginAt) < 120000;
}

function objectToList(obj) {
  if (!obj) return [];
  return Object.values(obj);
}

function unsavedChangedExist(unsavedChanges) {
  return (
    unsavedChanges &&
    ((unsavedChanges.panels && Object.keys(unsavedChanges.panels).length) ||
      (unsavedChanges.topics && Object.keys(unsavedChanges.topics).length) ||
      (unsavedChanges.tasks && Object.keys(unsavedChanges.tasks).length))
  );
}
