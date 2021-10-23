import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
// import './App.global.css';

import React, { useEffect, useState } from 'react';
import LinearProgressWithLabel from './LinearProgressWithLabel.jsx';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { styled } from '@mui/material/styles';

function useLocalStorageState(
  key,
  defaultValue = '',
  { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) {
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

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
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

const greenColor = '#91ff9a';
const yellowColor = '#ffff8a';

const ListItem = ({
  backgroundColor,
  handleOnClick,
  deleteTask,
  defaultElevation,
  icon = '',
  task,
}) => {
  const [elevation, setElevation] = useState(defaultElevation);

  return (
    <StyledPaper
      sx={{ borderColor: 'blue', backgroundColor }}
      elevation={elevation}
      key={task}
      onMouseDown={(event) => {
        if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
          deleteTask(task);
        } else if (event.button === 0) {
          handleOnClick(task);
        }
      }}
      // onPress={() => handleOnDoubleClick(task)}
      // onClick={() => handleOnClick(task)}
      onMouseEnter={() => setElevation(6)}
      onMouseLeave={() => setElevation(defaultElevation)}
    >
      {icon} {task}
    </StyledPaper>
  );
};

const TodoPanel = ({ closeTask, deleteTask, list = [] }) => {
  const defaultElevation = 2;
  return (
    <>
      <h2>To do</h2>
      <Stack spacing={2}>
        {list.map((task) => (
          <ListItem
            backgroundColor={yellowColor}
            defaultElevation={defaultElevation}
            handleOnClick={closeTask}
            deleteTask={() => deleteTask(task, 'todo')}
            // icon={'✅'}
            key={task}
            task={task}
          />
        ))}
      </Stack>
    </>
  );
};

const DonePanel = ({ deleteTask, list = [], openTask }) => {
  const defaultElevation = 2;

  return (
    <>
      <h2>Done</h2>
      <Stack spacing={2}>
        {list.map((task) => (
          <ListItem
            backgroundColor={greenColor}
            defaultElevation={defaultElevation}
            deleteTask={() => deleteTask(task, 'done')}
            handleOnClick={openTask}
            key={task}
            // icon={'😅'}
            task={task}
          />
        ))}
      </Stack>
    </>
  );
};

function calculateProgress({ doneList, todoList }) {
  console.log();
  console.log('doneList.length:', doneList.length);
  console.log('todoList.length:', todoList.length);
  console.log(
    'Math.floor(doneList.length / (doneList.length + todoList.length)):',
    Math.floor(doneList.length / (doneList.length + todoList.length))
  );
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
  const [inputTask, setInputTask] = useState('');
  // const [doneList, setDoneList] = useState(initialDoneList);
  // const [todoList, setTodoList] = useState(initialTodoList);
  const [doneList, setDoneList] = useLocalStorageState(
    'doneList',
    initialDoneList
  );
  const [todoList, setTodoList] = useLocalStorageState(
    'todoList',
    initialTodoList
  );

  const [everCreatedTasks, setEverCreatedTasks] = useLocalStorageState(
    'everCreatedTasks',
    []
  );

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('Something Changed');
    setProgress(calculateProgress({ doneList, todoList }));
    // return () => {
    //   cleanup;
    // };
  }, [doneList, todoList]);

  // function taskExists(task) {
  //   return todoList.includes(task) || doneList.includes(task);
  // }

  function closeTask(task) {
    console.log(`Closing task ${task}`);
    setTodoList((todoList) => todoList.filter((todoTask) => todoTask !== task));
    setDoneList((doneList) => [...doneList, task]);
  }

  function addTodoTask(task) {
    console.log(`Adding todo task ${task}`);
    setTodoList((todoList) => [...todoList, task]);
  }

  function openTask(task) {
    console.log(`Opening task ${task}`);
    setDoneList((doneList) => doneList.filter((todoTask) => todoTask !== task));
    addTodoTask(task);
  }

  function deleteTask(task, listName) {
    console.log(`Deleting task ${task} from ${listName} list`);
    if (listName === 'done') {
      setDoneList((doneList) =>
        doneList.filter((doneTask) => doneTask !== task)
      );
    } else if (listName === 'todo') {
      console.log('here');
      setTodoList((todoList) =>
        todoList.filter((todoTask) => todoTask !== task)
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
              // const newTask = event.target.inputTask.value;
              addTodoTask(inputTask);
              if (!everCreatedTasks.includes(inputTask)) {
                setEverCreatedTasks((everCreatedTasks) => {
                  const newList = [...everCreatedTasks, inputTask];
                  console.log('newList:', newList);
                  while (newList.length > 2) newList.shift();
                  return newList;
                });
              }
              setInputTask('');
            }}
          >
            <Autocomplete
              id="inputTask"
              value={inputTask}
              onChange={(event) => setInputTask(event.target.value)}
              // type="submit"
              // onSubmit={(event) => addTodoTask(event.target.value)}
              freeSolo
              disableClearable
              options={everCreatedTasks.map((option) => {
                return option || '';
              })}
              getOptionLabel={(option) => (option !== 0 ? option : '')} // TODO: fix selection returning 0 the first time selected
              renderInput={(params) => (
                <TextField
                  {...params}
                  //     onClick={() => {}}
                  label="Add Task"
                  //     InputProps={{
                  //       ...params.InputProps,
                  //       type: 'search',
                  //     }}
                />
              )}
            />
            {/* <Autocomplete
            freeSolo
            options={['asdfasd', 'asdfasdf'].map((option) => option)}
            renderInput={(params) => <TextField {...params} label="freeSolo" />}
          /> */}
          </form>
        </Box>

        <div>
          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
            {/* <hr /> */}
            <Grid item xs={6}>
              <TodoPanel
                deleteTask={deleteTask}
                list={todoList}
                closeTask={closeTask}
              />
            </Grid>
            {/* <hr /> */}
            <Grid item xs={6}>
              <DonePanel
                deleteTask={deleteTask}
                list={doneList}
                openTask={openTask}
              />
            </Grid>
            {/* <hr /> */}
            {/* <SimplePaper /> */}
          </Grid>
          {/* </Box> */}
        </div>
      </Container>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        {/* <Route path="/" component={Hello} /> */}
        <Route path="/" component={Panel} />
      </Switch>
    </Router>
  );
}
