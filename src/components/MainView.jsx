import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';

import CreateTaskForm from './CreateTaskForm.jsx';
import LinearProgressWithLabel from './progress/LinearProgressWithLabel';
import Panel from './Panel.jsx';
import PanelTabs from './PanelTabs.jsx';
import SaveButton from './SaveButton';
import TopicsFilter from './TopicFilter.jsx';
import ViewSelector from './ViewSelector.jsx';

import * as database from '../database/firebase.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js';
import usePanels from '../hooks/usePanels.js';
import useTasks from '../hooks/useTasks.js';
import useTopics from '../hooks/useTopics.js';
import { objectToList } from '../utils.js';

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

  const [confettiedPanels, setConfettiedPanels] = useLocalStorageState({
    defaultValue: [],
    key: `tasks:confettied-panels`,
  });

  const { panels, panelsList, setPanels, addPanel, deletePanel } = usePanels({
    defaultValue: {},
    selectedTab,
    setConfettiedPanels,
    setSelectedTab,
    setUnsavedChanges,
  });

  const selectedPanel = useMemo(() => {
    return panelsList && (selectedTab || selectedTab === 0)
      ? panelsList[selectedTab]
      : null;
  }, [panelsList, selectedTab]);

  const { topics, topicsList, setTopics, addTopic, deleteTopic } = useTopics({
    defaultValue: {},
    setUnsavedChanges,
  });

  const { tasks, setTasks, addTask, deleteTask, updateTask, moveTaskToPanel } =
    useTasks({
      defaultValue: {},
      panelsList,
      selectedTab,
      setUnsavedChanges,
    });

  const [inputTopicName, setInputTopicName] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'tasks:input-topic-name',
  });

  const [stacksCount, setStacksCount] = useLocalStorageState({
    defaultValue: 2,
    key: 'tasks:stacks-count',
  });

  const [selectedTopicFilterIndex, setSelectedTopicFilterIndex] =
    useLocalStorageState({
      defaultValue: null,
      key: 'tasks:selected-topic-id-filter',
    });

  const [selectedInputTopicId, setSelectedInputTopicId] = useLocalStorageState({
    defaultValue: '',
    key: 'tasks:selected-input-topic-id',
  });
  const selectedInputTopic = topicsList
    ? topicsList.find((topic) => topic.id === selectedInputTopicId)
    : null;

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
  }, [setPanels, setSelectedTab, setTasks, setTopics, user]);

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

  const saveData = useCallback(
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

      if (
        (panelsToUpdate && Object.keys(panelsToUpdate).length > 0) ||
        (tasksToUpdate && Object.keys(tasksToUpdate).length > 0) ||
        (topicsToUpdate && Object.keys(topicsToUpdate).length > 0)
      ) {
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
        }
        if (tasksToUpdate && Object.keys(tasksToUpdate).length > 0) {
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
        }
        if (topicsToUpdate && Object.keys(topicsToUpdate).length > 0) {
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
    },
    [saveStatus, user]
  );

  // Set interval to perform updates on db where needed
  useEffect(() => {
    const intervalId = setInterval(saveData, 30000);
    return () => clearInterval(intervalId);
  }, [saveData]);

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
  }, [setPanels, setTasks, setTopics, user]);

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
          <Box
            sx={{
              marginTop: '9px',
              width: '99%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <LinearProgressWithLabel hidelabel={1} progress={0} />
          </Box>
          <CreateTaskForm
            addTask={({ taskTitle }) =>
              addTask({
                taskTitle,
                topic: selectedInputTopic,
                panelId: selectedPanel.id,
              })
            }
            selectedInputTopicId={selectedInputTopicId}
            setSelectedInputTopicId={setSelectedInputTopicId}
            topicsList={topicsList}
          />
          <Box
            marginTop="10px"
            sx={{
              display: 'flex',
              flexFlow: 'row wrap',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <Box display="flex">
              <ViewSelector
                setStacksCount={setStacksCount}
                stacksCount={stacksCount}
              />
              <TopicsFilter
                deleteTopic={deleteTopic}
                selectedTopicFilterIndex={selectedTopicFilterIndex}
                setSelectedTopicFilterIndex={setSelectedTopicFilterIndex}
                topicsList={topicsList}
              />
            </Box>
            <Box
              sx={{
                width: '22.9%',
              }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const topicName = event.target.topicName.value;
                  const creationStarted = addTopic(topicName);
                  if (creationStarted) {
                    setInputTopicName('');
                  }
                }}
              >
                <TextField
                  name="topicName"
                  onChange={(event) => {
                    let value = event.target.value;
                    if (value.length === 1) {
                      value = value.toUpperCase();
                    }
                    setInputTopicName(value);
                  }}
                  label="Add Topic"
                  size="small"
                  value={inputTopicName}
                />
              </form>
            </Box>
          </Box>
          {panels && selectedPanel ? (
            <>
              <Panel
                addTopic={addTopic}
                allTasksView={allTasksView}
                confettiedPanels={confettiedPanels}
                deleteTask={deleteTask}
                deleteTopic={deleteTopic}
                moveTaskToNextPanel={
                  panelsList &&
                  selectedTab &&
                  panelsList.length > selectedTab + 1
                    ? (task) =>
                        moveTaskToPanel({ task, destinationPanel: 'next' })
                    : null
                }
                moveTaskToPreviousPanel={(task) =>
                  panelsList &&
                  selectedTab &&
                  panelsList.length > selectedTab - 1
                    ? moveTaskToPanel({ task, destinationPanel: 'previous' })
                    : null
                }
                moveTaskToSelectedPanel={
                  selectedTab && selectedPanel
                    ? (task) =>
                        moveTaskToPanel({ task, destinationPanel: 'selected' })
                    : null
                }
                removeTaskFromPanel={
                  selectedTab && selectedPanel
                    ? (task) =>
                        moveTaskToPanel({ task, destinationPanel: 'none' })
                    : null
                }
                setSelectedInputTopicId={setSelectedInputTopicId}
                stacksCount={stacksCount}
                panelData={selectedPanel}
                selectedTopicFilterIndex={selectedTopicFilterIndex}
                setConfettiedPanels={setConfettiedPanels}
                tasksList={objectToList(tasks)
                  .filter((task) => !task.dateDeleted)
                  .sort(
                    (task1, task2) => task1.dateModified - task2.dateModified
                  )}
                topicsList={topicsList}
                updatePanelMetadata={
                  () => {}
                  // allTasksView
                  //   ? () => {}
                  //   : (updates) =>
                  //       updatePanelMetadata({
                  //         panelId: selectedPanel.id,
                  //         updates,
                  //       })
                }
                updateTask={updateTask}
                userId={user?.uid}
              />
            </>
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

function unsavedChangedExist(unsavedChanges) {
  return (
    unsavedChanges &&
    ((unsavedChanges.panels && Object.keys(unsavedChanges.panels).length) ||
      (unsavedChanges.topics && Object.keys(unsavedChanges.topics).length) ||
      (unsavedChanges.tasks && Object.keys(unsavedChanges.tasks).length))
  );
}
