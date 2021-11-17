// import { isChrome, isChromium } from 'react-device-detect';
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import AllTasksView from './AllTasksView.jsx';
import ItemStack from './ItemStack.jsx';
import InputTopicSelector from './InputTopicSelector.jsx';
import LinearProgressWithLabel from './progress/LinearProgressWithLabel';
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
  const [inputTaskTitle, setInputTaskTitle] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'tasks:input-task-title',
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

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

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
      {/* <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          '& > :not(style)': {
            m: 1,
            width: 128,
            height: 128,
          },
        }}
      > */}
      <Box
        sx={{
          marginTop: '9px',
          width: '99%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <LinearProgressWithLabel hidelabel={1} progress={panelProgress} />
      </Box>
      <Box paddingTop="10px" paddingBottom="4px">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputTaskTitle) {
              const taskCreated = addTask(
                inputTaskTitle,
                selectedInputTopic,
                panelId
              );
              if (taskCreated) {
                if (!everCreatedTaskTitles.includes(inputTaskTitle)) {
                  setEverCreatedTaskTitles((everCreatedTaskTitles) => {
                    const taskTitles = [
                      ...everCreatedTaskTitles,
                      inputTaskTitle,
                    ];
                    while (taskTitles.length > 5) taskTitles.shift();
                    return taskTitles;
                  });
                }
                setInputTaskTitle('');
              }
            }
          }}
        >
          <Box display="flex" gap="10px">
            <InputTopicSelector
              selectedTopicId={selectedInputTopic ? selectedInputTopicId : ''}
              setSelectedTopicId={setSelectedInputTopicId}
              topicsList={topicsList}
            />
            <Autocomplete
              sx={{ width: '100%' }}
              id="inputTaskTitle"
              disabled={!allowInput}
              value={inputTaskTitle || ''}
              inputValue={inputTaskTitle || ''}
              onChange={(event, newValue) => {
                setInputTaskTitle(newValue);
              }}
              onInputChange={(event, newValue) => {
                const updatedValue =
                  newValue.length === 1 ? newValue.toUpperCase() : newValue;
                setInputTaskTitle(updatedValue);
              }}
              freeSolo
              disableClearable
              // options={everCreatedTaskTitles.map((option) => option)}
              options={[].map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Task"
                  size="small"
                  //     InputProps={{
                  //       ...params.InputProps,
                  //       type: 'search',
                  //     }}
                  InputProps={{
                    endAdornment: inputTaskTitle ? (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setInputTaskTitle('');
                        }}
                      >
                        <ClearIcon fontSize="10" />
                      </IconButton>
                    ) : null,
                  }}
                />
              )}
            />
            <Button
              sx={{
                borderColor: 'rgb(196,196,196)',
                width: '13.8%',
                minWidth: '40px',
              }}
              size="small"
              variant="outlined"
              type="submit"
            >
              <ArrowForwardIcon color="action" fontSize="small" />
            </Button>
          </Box>
        </form>
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
