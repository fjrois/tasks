// import { isChrome, isChromium } from 'react-device-detect';
import React, { useEffect, useMemo, useState } from 'react';

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
// import useDatabaseState from '../hooks/useDatabaseState.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js'; // TODO: use this when no connectivity

import TopicsView from './TopicFilter.jsx';

const topics = {
  id1: { name: 'Tasks' },
  id2: { name: '' },
  id3: { name: 'Epic React' },
};

function calculateProgress({ doneTasksList, todoTasksList }) {
  if (!todoTasksList.length) return 100;
  if (doneTasksList.length) {
    return Math.floor(
      (doneTasksList.length / (doneTasksList.length + todoTasksList.length)) *
        100
    );
  }
  return 0;
}

export default function Panel({
  allowInput = true,
  createTask,
  data: { id: panelId, name: panelName },
  // database,
  deleteTask,
  moveTaskToPanel,
  tasksList = [],
  updatePanelMetadata,
  updateTask,
  // user,
}) {
  const [inputTaskTitle, setInputTaskTitle] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'inputTaskTitle',
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
  //   dbPath: `/lists/${user}/${panelId}`,
  //   // debounce: 200,
  //   defaultValue: initialTasksList,
  // });

  // const [doneList, setDoneList] = useDatabaseState({
  //   database,
  //   dbPath: `/lists/${user}/${panelId}/done`,
  //   // debounce: 200,
  //   defaultValue: initialDoneList,
  // });
  // const [todoList, setTodoList] = useDatabaseState({
  //   database,
  //   dbPath: `/lists/${user}/${panelId}/todo`,
  //   // debounce: 200,
  //   defaultValue: initialTodoList,
  // });
  const [selectedTopicIdFilter, setSelectedTopicIdFilter] =
    useLocalStorageState({
      defaultValue: null,
      key: 'tasks:selected-topic-id-filter',
    });
  const selectedTopicFilter = topics[selectedTopicIdFilter];

  const filteredTasksList = useMemo(() => {
    return tasksList && selectedTopicFilter?.name
      ? tasksList.filter(
          (task) => task?.topic?.name === selectedTopicFilter.name
        )
      : tasksList;
  }, [selectedTopicFilter, tasksList]);

  const doneTasksList = useMemo(() => {
    return filteredTasksList
      ? filteredTasksList.filter((task) => task && task.status === 'done')
      : [];
  }, [filteredTasksList]);

  const todoTasksList = useMemo(() => {
    return filteredTasksList
      ? filteredTasksList.filter((task) => task && task.status === 'todo')
      : [];
  }, [filteredTasksList]);

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);

  const [selectedInputTopicId, setSelectedInputTopicId] = useLocalStorageState({
    defaultValue: '',
    key: 'tasks:selected-input-topic-id',
  });

  useEffect(() => {
    const updatedProgress = calculateProgress({ doneTasksList, todoTasksList });
    setProgress(updatedProgress);
  }, [doneTasksList, todoTasksList]);

  useEffect(() => {
    updatePanelMetadata({ progress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

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
      <Box paddingTop="15px" paddingBottom="7px">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputTaskTitle) {
              const taskCreated = createTask(
                inputTaskTitle,
                topics[selectedInputTopicId]
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
              selectedTopicId={selectedInputTopicId}
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
              sx={{ borderColor: 'rgb(196,196,196)' }}
              borderColor="secondary"
              size="small"
              variant="outlined"
              type="submit"
            >
              <ArrowForwardIcon color="action" fontSize="small" />
            </Button>
          </Box>
        </form>
        <Box marginTop="10px">
          <TopicsView
            selectedTopicId={selectedTopicIdFilter}
            setSelectedTopicId={setSelectedTopicIdFilter}
            topics={topics}
          />
        </Box>
      </Box>

      <div>
        <Grid sx={{ flexGrow: 1 }} container spacing={2}>
          <Grid item xs={6}>
            <ItemStack
              handleItemClick={(taskToUpdate) =>
                updateTask(taskToUpdate, { status: 'done' })
              }
              handleItemMiddleClick={deleteTask}
              list={todoTasksList}
              moveTaskToPanel={moveTaskToPanel}
              type="todo"
            />
          </Grid>
          <Grid item xs={6}>
            <ItemStack
              handleItemClick={(taskToUpdate) =>
                updateTask(taskToUpdate, { status: 'todo' })
              }
              handleItemMiddleClick={deleteTask}
              list={doneTasksList}
              type="done"
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
}
