import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// import icon from '../../assets/icon.svg';
// import './App.global.css';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import LinearProgressWithLabel from './LinearProgressWithLabel.jsx';

function useLocalStorageState({
  debounce,
  defaultValue = '',
  key,
  parsers: { serialize = JSON.stringify, deserialize = JSON.parse } = {},
}) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      try {
        return deserialize(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(key);
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });
  const prevKeyRef = React.useRef(key);

  function updateLocalStorage() {
    console.log(`Saving new ${key} value in localStorage`);
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
  }

  React.useEffect(() => {
    if (debounce) {
      const timeoutId = setTimeout(() => {
        updateLocalStorage();
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      updateLocalStorage();
    }
  }, [key, state, serialize]);

  return [state, setState];
}

// const Hello = () => {
//   return (
//     <div>
//       <div className="Hello">
//         <img width="200px" alt="icon" src={icon} />
//       </div>
//       <h1>electron-react-boilerplate</h1>
//       <div className="Hello">
//         <a
//           href="https://electron-react-boilerplate.js.org/"
//           target="_blank"
//           rel="noreferrer"
//         >
//           <button type="button">
//             <span role="img" aria-label="books">
//               📚
//             </span>
//             Read our docs
//           </button>
//         </a>
//         <a
//           href="https://github.com/sponsors/electron-react-boilerplate"
//           target="_blank"
//           rel="noreferrer"
//         >
//           <button type="button">
//             <span role="img" aria-label="books">
//               🙏
//             </span>
//             Donate
//           </button>
//         </a>
//       </div>
//     </div>
//   );
// };

const StyledPaper = styled(Paper)(({ theme }) => ({
  // ...theme.typography.body2,
  color: theme.palette.text.secondary,
  height: 80,
  lineHeight: '70px',
  textAlign: 'center',
  // backgroundColor: '#ffff8a',
  // border: `3px solid yellow`,
}));

const colors = {
  green: '#91ff9a',
  yellow: '#ffff8a',
};

const ListItem = ({
  backgroundColor,
  defaultElevation,
  handleItemMiddleClick,
  handleOnClick,
  icon = '',
  task,
}) => {
  const [elevation, setElevation] = useState(defaultElevation);

  return (
    <StyledPaper
      sx={{ backgroundColor }}
      elevation={elevation}
      key={task.id}
      onMouseDown={(event) => {
        handleItemMiddleClick(task);
        if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
        } else if (event.button === 0) {
          handleOnClick(task);
        }
      }}
      // onPress={() => handleOnDoubleClick(task)}
      // onClick={() => handleOnClick(task)}
      onMouseEnter={() => setElevation(6)}
      onMouseLeave={() => setElevation(defaultElevation)}
    >
      {icon || null} {task ? task.title : null}
    </StyledPaper>
  );
};

const ItemStack = ({
  handleItemClick,
  handleItemMiddleClick,
  list = [],
  type: listType,
}) => {
  const defaultElevation = 2;
  const checked = true;

  let itemBackgroundColor, title;
  if (listType === 'done') {
    itemBackgroundColor = colors.green;
    title = 'Done';
  } else if (listType === 'todo') {
    itemBackgroundColor = colors.yellow;
    title = 'To do';
  }

  // const loadedListRef = useRef(list.length === 0 ? [] : [list[0]]);

  // useEffect(() => {
  //   console.log('loadedListRef.current:', loadedListRef.current);
  //   if (loadedListRef.current.length < list) {
  //     loadedListRef.current = [
  //       ...loadedListRef.current,
  //       list[loadedListRef.current.length + 1],
  //     ];
  //   }
  // });

  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    setFirstRender(false);
  }, []);

  return (
    <>
      <Box
        sx={{
          // display: 'flex',
          // flexWrap: 'wrap',
          '& > :not(style)': {
            m: 1,
            // width: 128,
            height: 28,
            textAlign: 'center',
          },
        }}
      >
        <h2>{title}</h2>
      </Box>
      <Stack spacing={2}>
        {/* {loadedListRef.current.map((task) => ( */}
        {list.map((task, index) => {
          return (
            <Grow
              in={checked}
              key={task.id}
              // enter
              // appear
              // mountOnEnter
              style={{
                transformOrigin: '0 0 0',
                transitionDelay: firstRender ? '200ms' : '0ms',
              }}
              {...(checked ? { timeout: firstRender ? 2000 : 200 } : {})}
            >
              <span>
                <ListItem
                  backgroundColor={itemBackgroundColor}
                  defaultElevation={defaultElevation}
                  handleOnClick={handleItemClick}
                  handleItemMiddleClick={() =>
                    handleItemMiddleClick(task, listType)
                  }
                  // icon={'✅'}
                  task={task}
                />
              </span>
            </Grow>
          );
        })}
      </Stack>
    </>
  );
};

function calculateProgress({ doneList, todoList }) {
  if (!todoList.length) return 100;
  if (doneList.length) {
    return Math.floor(
      (doneList.length / (doneList.length + todoList.length)) * 100
    );
  }
  return 0;
}

// const initialDoneList = ['Do d', 'Do e', 'Do f'];
// const initialTodoList = ['Do a', 'Do b', 'Do c'];
const initialDoneList = [];
const initialTodoList = [];

const Panel = () => {
  const [inputTaskTitle, setInputTaskTitle] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'inputTaskTitle',
  });
  // const [doneList, setDoneList] = useState(initialDoneList);
  // const [todoList, setTodoList] = useState(initialTodoList);
  const [doneList, setDoneList] = useLocalStorageState({
    debounce: true,
    defaultValue: initialDoneList,
    key: 'doneList',
  });
  const [todoList, setTodoList] = useLocalStorageState({
    debounce: true,
    defaultValue: initialTodoList,
    key: 'todoList',
  });

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(calculateProgress({ doneList, todoList }));
  }, [doneList, todoList]);

  function findTaskTitleInAnyList(taskTitle) {
    if (todoList.find((todoTask) => todoTask.title === taskTitle))
      return 'todo';
    if (doneList.find((doneTask) => doneTask.title === taskTitle))
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
      <Container fixed maxWidth="sm">
        <Box
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
        </Box>
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
        <Box>
          {' '}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputTaskTitle) {
                const taskCreated = createTask(inputTaskTitle);
                if (!everCreatedTaskTitles.includes(inputTaskTitle)) {
                  setEverCreatedTaskTitles((everCreatedTaskTitles) => {
                    const taskTitles = [
                      ...everCreatedTaskTitles,
                      inputTaskTitle,
                    ];
                    while (taskTitles.length > 10) taskTitles.shift();
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
              options={everCreatedTaskTitles.map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Task"
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
      </Container>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Panel} />
      </Switch>
    </Router>
  );
}
