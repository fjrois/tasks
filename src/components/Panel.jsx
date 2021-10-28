import React, { useEffect, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import ItemStack from './ItemStack.jsx';
import useDatabaseState from '../hooks/useDatabaseState.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js'; // TODO: use this when no connectivity

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
  createTask,
  data: { id: panelId, name: panelName },
  // database,
  deleteTask,
  moveTaskToPanel,
  tasksList,
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
  const doneTasksList = tasksList
    ? tasksList.filter((task) => task.status === 'done')
    : [];
  const todoTasksList = tasksList
    ? tasksList.filter((task) => task.status === 'todo')
    : [];

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);
  console.log('progress:', progress);

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
      <Box
        sx={{
          // alignContent: 'center',
          // display: 'block',
          // alignItems: 'center',
          // justifyContent: 'center',
          paddingTop: '15px',
          paddingBottom: '7px',
          // maxWidth: '80%',
          // width: '80%',
        }}
      >
        {' '}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputTaskTitle) {
              const taskCreated = createTask(inputTaskTitle);
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
          <Autocomplete
            id="inputTaskTitle"
            value={inputTaskTitle || ''}
            inputValue={inputTaskTitle || ''}
            onChange={(event, newValue) => {
              setInputTaskTitle(newValue);
            }}
            onInputChange={(event, newValue) => {
              setInputTaskTitle(newValue);
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
              />
            )}
          />
        </form>
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