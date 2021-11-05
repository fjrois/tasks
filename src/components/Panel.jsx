// import { isChrome, isChromium } from 'react-device-detect';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import ItemStack from './ItemStack.jsx';
import InputTopicSelector from './InputTopicSelector.jsx';
import TopicsFilter from './TopicFilter.jsx';
// import useDatabaseState from '../hooks/useDatabaseState.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js'; // TODO: use this when no connectivity
import ViewSelector from './ViewSelector.jsx';

function calculateProgress({ doingTasksList, doneTasksList, todoTasksList }) {
  if (!doneTasksList.length) return 0;
  const result = Math.floor(
    (doneTasksList.length /
      (doneTasksList.length + doingTasksList.length + todoTasksList.length)) *
      100
  );
  return result;
}

export default function Panel({
  allowInput = true,
  createTask,
  data: { id: panelId, name: panelName },
  database,
  deleteTask,
  moveTaskToPanel,
  setTopics,
  tasksList = [],
  topics,
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

  // const [doneList, setDoneList] = useState(initialDoneList);
  // const [todoList, setTodoList] = useState(initialTodoList);
  // const formattedPanelName = panelName.toLowerCase().replaceAll(' ', '');
  // const [doneList, setDoneList] = useLocalStorageState({
  //   debounce: 200,
  //   defaultValue: initialDoneList,
  //   key: `${formattedPanelName}_doneList`,
  // });
  // const [todoList, setTodoList] = useLocalStorageState({
  //   debounce: 200,
  //   defaultValue: initialTodoList,
  //   key: `${formattedPanelName}_todoList`,
  // });

  // const [tasksList, setTasksList] = useDatabaseState({
  //   database,
  //   dbPath: `/lists/${userId}/${panelId}`,
  //   // debounce: 200,
  //   defaultValue: initialTasksList,
  // });

  // const [doneList, setDoneList] = useDatabaseState({
  //   database,
  //   dbPath: `/lists/${userId}/${panelId}/done`,
  //   // debounce: 200,
  //   defaultValue: initialDoneList,
  // });
  // const [todoList, setTodoList] = useDatabaseState({
  //   database,
  //   dbPath: `/lists/${userId}/${panelId}/todo`,
  //   // debounce: 200,
  //   defaultValue: initialTodoList,
  // });
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
  const selectedTopicFilter = topics ? topics[selectedTopicFilterIndex] : null;

  const [selectedInputTopicId, setSelectedInputTopicId] = useLocalStorageState({
    defaultValue: '',
    key: 'tasks:selected-input-topic-id',
  });
  const selectedInputTopic = topics
    ? topics.find((topic) => topic.id === selectedInputTopicId)
    : null;

  useEffect(() => {
    setSelectedInputTopicId(selectedTopicFilter?.id || '');
  }, [selectedTopicFilter, setSelectedInputTopicId]);

  const filteredTasksList = useMemo(() => {
    return tasksList && selectedTopicFilter?.name
      ? tasksList.filter(
          (task) => task?.topic?.name === selectedTopicFilter.name
        )
      : tasksList;
  }, [selectedTopicFilter, tasksList]);
  // const filteredTasksList =
  //   tasksList && selectedTopicFilter?.name
  //     ? tasksList.filter(
  //         (task) => task?.topic?.name === selectedTopicFilter.name
  //       )
  //     : tasksList;

  const doneTasksList = useMemo(() => {
    return filteredTasksList
      ? filteredTasksList.filter((task) => task && task.status === 'done')
      : [];
  }, [filteredTasksList]);
  // const doneTasksList = filteredTasksList
  //   ? filteredTasksList.filter((task) => task && task.status === 'done')
  //   : [];

  const todoTasksList = useMemo(() => {
    return filteredTasksList
      ? filteredTasksList.filter(
          (task) =>
            (task && task.status === 'todo') ||
            (!showDoingStack && task.status === 'doing')
        )
      : [];
  }, [filteredTasksList, showDoingStack]);
  // const todoTasksList = filteredTasksList
  //   ? filteredTasksList.filter(
  //       (task) =>
  //         (task && task.status === 'todo') ||
  //         (!showDoingStack && task.status === 'doing')
  //     )
  //   : [];

  const doingTasksList = useMemo(() => {
    return filteredTasksList
      ? filteredTasksList.filter((task) => task && task.status === 'doing')
      : [];
  }, [filteredTasksList]);
  // const doingTasksList = filteredTasksList
  //   ? filteredTasksList.filter((task) => task && task.status === 'doing')
  //   : [];

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);

  const prevProgressRef = useRef(0);
  useEffect(() => {
    let updatedProgress = calculateProgress({
      doingTasksList,
      doneTasksList,
      todoTasksList,
    });

    if (prevProgressRef.current !== updatedProgress) {
      prevProgressRef.current = updatedProgress;
      setProgress(updatedProgress);
    }
  }, [doingTasksList, doneTasksList, todoTasksList]);

  useEffect(() => {
    updatePanelMetadata({ progress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  function createTopic(topicName) {
    console.log('topicName:', topicName);
    if (!topicName) return;
    if (!topics || !topics.find((topic) => topic.name === topicName)) {
      setTopics((topics) => {
        console.log(`Creating topic with name ${topicName}`);
        const newTopicData = {
          dateCreated: Date.now(),
          id: `topic-${uuidv4()}`,
          name: topicName,
        };
        const updatedTopics = topics ? [...topics] : [];
        updatedTopics.push(newTopicData);
        return updatedTopics;
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
      setTopics((topics) => {
        if (topics) {
          console.log(`Deleting topic ${topicToDelete.name}`);
          const updatedTopics = topics.filter(
            (topic) => topic.id !== topicToDelete.id
          );
          return updatedTopics;
        }
      });
      return true;
    }
  }

  // function createTask(taskTitle) {
  //   const foundTask = findTaskTitle(taskTitle);
  //   if (foundTask) {
  //     console.log(
  //       `There is already a task with the title ${taskTitle} in the '${foundTask.status}' list`
  //     );
  //   } else {
  //     console.log(`Creating task ${taskTitle}`);
  //     const task = {
  //       dateCreated: Date.now(),
  //       id: uuidv4(),
  //       status: 'todo',
  //       title: taskTitle,
  //     };
  //     console.log('task:', task);
  //     setTasksList((tasksList) => [...tasksList, task]);
  //     return task;
  //   }
  // }

  // function deleteTask(taskToDelete) {
  //   console.log(`Deleting task "${taskToDelete.title}" (${taskToDelete.id})`);
  //   setTasksList((tasksList) =>
  //     tasksList.filter((task) => task.id !== taskToDelete.id)
  //   );
  // }

  // function findTaskTitle(taskTitle) {
  //   const foundTask = tasksList.find(
  //     (task) => task?.title?.toLowerCase() === taskTitle.toLowerCase()
  //   );
  //   return foundTask;
  // }

  // function updateTask(taskToUpdate, updates = {}) {
  //   console.log(
  //     `Updating task "${taskToUpdate.title}" (${
  //       taskToUpdate.id
  //     }): ${JSON.stringify(updates)}`
  //   );

  //   setTasksList((tasksList) => {
  //     const foundTaskIndex = tasksList.findIndex(
  //       (task) => task.id === taskToUpdate.id
  //     );
  //     if (foundTaskIndex === -1) {
  //       console.log(
  //         `Task ${taskToUpdate.title} (${taskToUpdate.id}) doesn't seem to exist in this panel`
  //       );
  //       return tasksList;
  //     }
  //     const foundTask = tasksList[foundTaskIndex];
  //     const updatedTask = { ...foundTask, ...updates };
  //     const updatedTasksList = [...tasksList];
  //     updatedTasksList[foundTaskIndex] = updatedTask;
  //     return updatedTasksList;
  //   });
  // }

  return (
    <>
      {/* <Box
        sx={{
          // display: 'flex',
          // flexWrap: 'wrap',
          '& > :not(style)': {
            m: 1,
            // width: 128,
            height: 28,
          },
        }}
      >
        <LinearProgressWithLabel value={progress} />
      </Box> */}
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
      <Box paddingTop="10px" paddingBottom="10px">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputTaskTitle) {
              const taskCreated = createTask(
                inputTaskTitle,
                selectedInputTopic
              );
              if (!everCreatedTaskTitles.includes(inputTaskTitle)) {
                setEverCreatedTaskTitles((everCreatedTaskTitles) => {
                  const taskTitles = [...everCreatedTaskTitles, inputTaskTitle];
                  while (taskTitles.length > 5) taskTitles.shift();
                  return taskTitles;
                });
              }
              if (taskCreated) {
                setInputTaskTitle('');
              }
            }
          }}
        >
          <Box display="flex" gap="10px">
            <InputTopicSelector
              selectedTopicId={selectedInputTopic ? selectedInputTopicId : ''}
              setSelectedTopicId={setSelectedInputTopicId}
              topics={topics}
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
              topics={topics}
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
                const creationStarted = createTopic(topicName);
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

      <div>
        <Grid sx={{ flexGrow: 1 }} container spacing={2}>
          <Grid item xs={showDoingStack ? 4 : 6}>
            <ItemStack
              moveTaskRight={(taskToUpdate) =>
                updateTask(taskToUpdate, {
                  status: showDoingStack ? 'doing' : 'done',
                })
              }
              deleteTask={deleteTask}
              list={todoTasksList}
              moveTaskToPanel={moveTaskToPanel}
              showDoingStack={showDoingStack}
              type="todo"
            />
          </Grid>
          {showDoingStack ? (
            <Grid item xs={4}>
              <ItemStack
                moveTaskRight={(taskToUpdate) =>
                  updateTask(taskToUpdate, { status: 'done' })
                }
                moveTaskLeft={(taskToUpdate) =>
                  updateTask(taskToUpdate, {
                    status: 'todo',
                  })
                }
                deleteTask={deleteTask}
                list={doingTasksList}
                moveTaskToPanel={moveTaskToPanel}
                showDoingStack={showDoingStack}
                type="doing"
              />
            </Grid>
          ) : null}
          <Grid item xs={showDoingStack ? 4 : 6}>
            <ItemStack
              moveTaskLeft={(taskToUpdate) =>
                updateTask(taskToUpdate, {
                  status: showDoingStack ? 'doing' : 'todo',
                })
              }
              deleteTask={deleteTask}
              list={doneTasksList}
              type="done"
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
}
