import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import ItemStack from './ItemStack.jsx';
import useDatabaseState from '../hooks/useDatabaseState.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js'; // TODO: use this when no connectivity

// const initialDoneList = ['Do d', 'Do e', 'Do f'];
// const initialTodoList = ['Do a', 'Do b', 'Do c'];
const initialDoneList = [];
const initialTodoList = [];

function calculateProgress({ doneList, todoList }) {
  if (!todoList.length) return 100;
  if (doneList.length) {
    return Math.floor(
      (doneList.length / (doneList.length + todoList.length)) * 100
    );
  }
  return 0;
}

export default function Panel({
  data: { id: panelId, name: panelName },
  database,
  updatePanelMetadata,
  user,
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
  const [doneList, setDoneList] = useDatabaseState({
    database,
    dbPath: `/lists/${user}/${panelId}/done`,
    // debounce: 200,
    defaultValue: initialDoneList,
  });
  const [todoList, setTodoList] = useDatabaseState({
    database,
    dbPath: `/lists/${user}/${panelId}/todo`,
    // debounce: 200,
    defaultValue: initialTodoList,
  });

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);
  console.log('progress:', progress);

  useEffect(() => {
    const updatedProgress = calculateProgress({ doneList, todoList });
    setProgress(updatedProgress);
  }, [doneList, todoList]);
  useEffect(() => {
    updatePanelMetadata({ progress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  function findTaskTitleInAnyList(taskTitle) {
    if (
      todoList.find(
        (todoTask) => todoTask.title.toLowerCase() === taskTitle.toLowerCase()
      )
    )
      return 'todo';
    if (
      doneList.find(
        (doneTask) => doneTask.title.toLowerCase() === taskTitle.toLowerCase()
      )
    )
      return 'done';
  }

  function closeTask(task) {
    console.log(`Closing task "${task.title}" (${task.id})`);
    setTodoList((todoList) =>
      todoList.filter(
        (todoTask) => todoTask.id !== task.id && todoTask.title !== task.title
      )
    );
    setDoneList((doneList) => [...doneList, task]);
  }

  function addTodoTask(task) {
    console.log(`Adding todo task "${task.title}" (${task.id})`);
    setTodoList((todoList) => [...todoList, task]);
  }

  function createTask(taskTitle) {
    const listWithTask = findTaskTitleInAnyList(taskTitle);
    if (listWithTask) {
      console.log(
        `There is already a task with the title ${taskTitle} in the '${listWithTask}' list`
      );
    } else {
      console.log(`Creating task ${taskTitle}`);
      const task = { dateCreated: Date.now(), id: uuidv4(), title: taskTitle };
      console.log('task:', task);
      setTodoList((todoList) => [...todoList, task]);
      return task;
    }
  }

  function openTask(task) {
    console.log(`Opening task "${task.title}" (${task.id})`);
    setDoneList((doneList) =>
      doneList.filter(
        (todoTask) => todoTask.id !== task.id && todoTask.title !== task.title
      )
    );
    addTodoTask(task);
  }

  function deleteTask(task, listName) {
    console.log(
      `Deleting task "${task.title}" (${task.id}) from ${listName} list`
    );
    if (listName === 'done') {
      setDoneList((doneList) =>
        doneList.filter((doneTask) => doneTask.id !== task.id)
      );
    } else if (listName === 'todo') {
      setTodoList((todoList) =>
        todoList.filter((todoTask) => todoTask.id !== task.id)
      );
    }
  }

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
              handleItemClick={closeTask}
              handleItemMiddleClick={deleteTask}
              list={todoList}
              type="todo"
            />
          </Grid>
          {/* <hr /> */}
          <Grid item xs={6}>
            <ItemStack
              handleItemClick={openTask}
              handleItemMiddleClick={deleteTask}
              list={doneList}
              type="done"
            />
          </Grid>
          {/* <hr /> */}
        </Grid>
      </div>
    </>
  );
}
