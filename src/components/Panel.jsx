import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import AllTasksView from './AllTasksView.jsx';
import CreateTaskForm from './CreateTaskForm.jsx';
import ItemStack from './ItemStack.jsx';
import TopicsFilter from './TopicFilter.jsx';
import useLocalStorageState from '../hooks/useLocalStorageState.js';
import ViewSelector from './ViewSelector.jsx';

function calculatePanelProgress(tasks) {
  let todos = 0,
    doings = 0,
    dones = 0;
  tasks.forEach((task) => {
    if (task.status === 'todo') todos++;
    if (task.status === 'doing') doings++;
    if (task.status === 'done') dones++;
  });

  const progress = !dones
    ? 0
    : Math.floor((dones / (dones + doings + todos)) * 100);

  const potentialProgress =
    !dones && !doings
      ? 0
      : Math.floor(((dones + doings) / (dones + doings + todos)) * 100);

  return { progress, potentialProgress };
}

function sendConfettiFromSides() {
  const end = Date.now() + 2 * 1000;

  // const colors = ['#bb0000', '#ffffff'];
  (function frame() {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 65,
      origin: { x: 0 },
      // colors,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 65,
      origin: { x: 1 },
      // colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export default function Panel({
  addTask,
  addTopic,
  allowInput = true,
  allTasksView,
  confettiedPanels,
  deleteTask,
  deleteTopic,
  moveTaskToNextPanel,
  moveTaskToPreviousPanel,
  moveTaskToSelectedPanel,
  panelData: { id: panelId, name: panelName, progress: panelProgress },
  removeTaskFromPanel,
  setConfettiedPanels,
  tasksList = [],
  topicsList,
  updatePanelMetadata,
  updateTask,
  userId,
}) {
  const [inputTopicName, setInputTopicName] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'tasks:input-topic-name',
  });

  const [stacksCount, setStacksCount] = useLocalStorageState({
    defaultValue: 2,
    key: 'tasks:stacks-count',
  });

  const showDoingStack = stacksCount === 3;

  const [selectedTopicFilterIndex, setSelectedTopicFilterIndex] =
    useLocalStorageState({
      defaultValue: null,
      key: 'tasks:selected-topic-id-filter',
    });
  const selectedTopicFilter = topicsList
    ? topicsList[selectedTopicFilterIndex]
    : null;

  const [selectedInputTopicId, setSelectedInputTopicId] = useLocalStorageState({
    defaultValue: '',
    key: 'tasks:selected-input-topic-id',
  });
  const selectedInputTopic = topicsList
    ? topicsList.find((topic) => topic.id === selectedInputTopicId)
    : null;

  useEffect(() => {
    setSelectedInputTopicId(selectedTopicFilter?.id || '');
  }, [selectedTopicFilter, setSelectedInputTopicId]);

  // Filter by topic
  let filteredTasksList =
    tasksList && selectedTopicFilter?.name
      ? tasksList.filter(
          (task) => task?.topic?.name === selectedTopicFilter.name
        )
      : tasksList;

  // Filter by panel
  filteredTasksList =
    panelId && !allTasksView
      ? filteredTasksList.filter((task) => task?.panelId === panelId)
      : filteredTasksList;

  // const prevProgressRef = useRef(0);
  // const prevPotentialProgressRef = useRef(0);
  useEffect(() => {
    if (!tasksList) return;
    let { progress, potentialProgress } = calculatePanelProgress(tasksList);
    // if (
    // prevProgressRef.current !== progress &&
    // prevPotentialProgressRef.current !== potentialProgress
    // ) {
    updatePanelMetadata({
      progress: { real: progress, potential: potentialProgress },
    });

    if (!confettiedPanels.includes(panelId) && progress === 100) {
      sendConfettiFromSides();
      setConfettiedPanels((confettiedPanels) => [...confettiedPanels, panelId]);
    }
    // prevProgressRef.current = progress;
    // prevPotentialProgressRef.current = potentialProgress;
    // }
  }, [
    confettiedPanels,
    panelId,
    setConfettiedPanels,
    tasksList,
    updatePanelMetadata,
  ]);

  return (
    <>
      <CreateTaskForm
        allowInput={allowInput}
        addTask={({ taskTitle }) =>
          addTask({
            taskTitle,
            topic: selectedInputTopic,
            panelId,
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

      {allTasksView ? (
        <Box paddingTop="10px">
          <AllTasksView
            tasksList={filteredTasksList}
            moveTaskToSelectedPanel={moveTaskToSelectedPanel}
            userId={userId}
          />
        </Box>
      ) : (
        <div>
          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
            <Grid item xs={showDoingStack ? 4 : 6} sx={{ paddingTop: 0 }}>
              <ItemStack
                moveTaskRight={(taskToUpdate) =>
                  updateTask({
                    taskId: taskToUpdate.id,
                    updates: {
                      status: showDoingStack ? 'doing' : 'done',
                    },
                  })
                }
                deleteTask={deleteTask}
                list={
                  !filteredTasksList
                    ? []
                    : filteredTasksList.filter(
                        (task) =>
                          (task && task.status === 'todo') ||
                          (!showDoingStack && task.status === 'doing')
                      )
                }
                moveTaskToNextPanel={moveTaskToNextPanel}
                moveTaskToPreviousPanel={moveTaskToPreviousPanel}
                removeTaskFromPanel={removeTaskFromPanel}
                showDoingStack={showDoingStack}
                type="todo"
              />
            </Grid>
            {showDoingStack ? (
              <Grid item xs={4} sx={{ paddingTop: 0 }}>
                <ItemStack
                  moveTaskRight={(taskToUpdate) =>
                    updateTask({
                      taskId: taskToUpdate.id,
                      updates: { status: 'done' },
                    })
                  }
                  moveTaskLeft={(taskToUpdate) =>
                    updateTask({
                      taskId: taskToUpdate.id,
                      updates: {
                        status: 'todo',
                      },
                    })
                  }
                  deleteTask={deleteTask}
                  list={
                    !filteredTasksList
                      ? []
                      : filteredTasksList.filter(
                          (task) => task && task.status === 'doing'
                        )
                  }
                  moveTaskToNextPanel={moveTaskToNextPanel}
                  moveTaskToPreviousPanel={moveTaskToPreviousPanel}
                  removeTaskFromPanel={removeTaskFromPanel}
                  showDoingStack={showDoingStack}
                  type="doing"
                />
              </Grid>
            ) : null}
            <Grid item xs={showDoingStack ? 4 : 6} sx={{ paddingTop: 0 }}>
              <ItemStack
                moveTaskLeft={(taskToUpdate) =>
                  updateTask({
                    taskId: taskToUpdate.id,
                    updates: {
                      status: showDoingStack ? 'doing' : 'todo',
                    },
                  })
                }
                deleteTask={deleteTask}
                list={
                  !filteredTasksList
                    ? []
                    : filteredTasksList.filter(
                        (task) => task && task.status === 'done'
                      )
                }
                moveTaskToNextPanel={moveTaskToNextPanel}
                moveTaskToPreviousPanel={moveTaskToPreviousPanel}
                removeTaskFromPanel={removeTaskFromPanel}
                type="done"
              />
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
}
