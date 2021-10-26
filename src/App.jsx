import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import CircularProgressWithLabel from './CircularProgressWithLabel.jsx';
import LinearProgressWithLabel from './LinearProgressWithLabel.jsx';

const colors = {
  green: '#91ff9a',
  yellow: '#ffff8a',
};

function useLocalStorageState({
  debounce,
  defaultValue = '',
  key,
  parsers: { serialize = JSON.stringify, deserialize = JSON.parse } = {},
}) {
  const [state, setState] = useState(() => {
    console.log(`Restoring ${key} value from localStorage`);
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
  const prevKeyRef = useRef(key);

  useEffect(() => {
    function updateLocalStorage() {
      console.log(`Saving new ${key} value in localStorage`);
      const prevKey = prevKeyRef.current;
      if (prevKey !== key) {
        window.localStorage.removeItem(prevKey);
      }
      prevKeyRef.current = key;
      window.localStorage.setItem(key, serialize(state));
    }
    if (debounce) {
      const debounceMs = typeof debounce === 'number' ? debounce : 1000;
      const timeoutId = setTimeout(() => {
        updateLocalStorage();
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    } else {
      updateLocalStorage();
    }
  }, [debounce, key, serialize, state]);

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

// const StyledPaper = styled(Paper)(({ theme }) => ({
// ...theme.typography.body2,
// color: theme.palette.text.secondary,
// height: 80,
// lineHeight: '70px',
// minHeight: 100,
// textAlign: 'center',
// backgroundColor: '#ffff8a',
// border: `3px solid yellow`,
// }));

const ListItem = ({
  backgroundColor,
  defaultElevation,
  handleItemMiddleClick,
  handleOnClick,
  icon = '',
  task,
}) => {
  const [elevation, setElevation] = useState(defaultElevation);
  const higherElevation = 8;

  let clickStartMs;
  return (
    <Paper
      // variant={'outlined'}
      sx={{
        backgroundColor,
        color: 'text.secondary',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 50,
        padding: '15px',
        textAlign: 'center',
      }}
      elevation={elevation}
      key={task.id}
      onMouseDown={(event) => {
        clickStartMs = Date.now();
      }}
      onMouseUp={(event) => {
        const clickTimeMs = Date.now() - clickStartMs;
        if (clickTimeMs > 600) {
          handleItemMiddleClick(task);
        } else {
          if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
            handleItemMiddleClick(task);
          } else if (event.button === 0) {
            handleOnClick(task);
          }
        }
      }}
      // onPress={() => handleOnDoubleClick(task)}
      // onClick={() => handleOnClick(task)}
      onMouseEnter={() => setElevation(higherElevation)}
      onMouseLeave={() => setElevation(defaultElevation)}
    >
      {icon || null} {task ? task.title : null}
    </Paper>
  );
};

const ItemStack = ({
  handleItemClick,
  handleItemMiddleClick,
  list = [],
  type: listType,
}) => {
  const defaultElevation = 1;
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
    <Box>
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
          color: 'text.secondary',
        }}
      >
        <h3>{title.toUpperCase()}</h3>
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
              {...(checked ? { timeout: firstRender ? 1000 : 200 } : {})}
            >
              <span>
                <ListItem
                  backgroundColor={itemBackgroundColor}
                  defaultElevation={defaultElevation}
                  handleOnClick={handleItemClick}
                  handleItemMiddleClick={() =>
                    handleItemMiddleClick(task, listType)
                  }
                  task={task}
                />
              </span>
            </Grow>
          );
        })}
      </Stack>
    </Box>
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

const Panel = ({ data: { name: panelName }, updatePanelMetadata }) => {
  const [inputTaskTitle, setInputTaskTitle] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'inputTaskTitle',
  });

  // const [doneList, setDoneList] = useState(initialDoneList);
  // const [todoList, setTodoList] = useState(initialTodoList);
  const formattedPanelName = panelName.toLowerCase().replaceAll(' ', '');
  const [doneList, setDoneList] = useLocalStorageState({
    debounce: 200,
    defaultValue: initialDoneList,
    key: `${formattedPanelName}_doneList`,
  });
  const [todoList, setTodoList] = useLocalStorageState({
    debounce: 200,
    defaultValue: initialTodoList,
    key: `${formattedPanelName}_todoList`,
  });

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updatedProgress = calculateProgress({ doneList, todoList });
    setProgress(updatedProgress);
    updatePanelMetadata({ progress: updatedProgress });
  }, [doneList, todoList]);

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
};

function PanelsCluster() {
  const [panelsList, setPanelsList] = useLocalStorageState({
    debounce: 400,
    key: 'panelsList',
    defaultValue: [
      // { id: 'id1', name: 'Panel 1' },
      // { id: 'id2', name: 'Panel 2' },
      // { id: 'id3', name: 'Panel 3' },
    ],
  });
  const [selectedTab, setSelectedTab] = useState(0);

  function updatePanelMetadata({ panelId, updates }) {
    const { progress } = updates;
    setPanelsList((panelsList) => {
      const foundPanelIndex = panelsList.findIndex(
        (panel) => panel.id === panelId
      );
      const foundPanelData = panelsList[foundPanelIndex];
      const updatedPanel = { ...foundPanelData };
      updatedPanel.progress = progress;
      const updatedPanelList = [...panelsList];
      updatedPanelList[foundPanelIndex].progress = progress;
      return updatedPanelList;
    });
  }

  function createPanel(panelName) {
    if (
      panelsList.find(
        (panel) => panel.name.toLowerCase() === panelName.toLowerCase()
      )
    ) {
      console.log(`There is already a panel with the name ${panelName}`);
    } else {
      console.log(`Creating panel ${panelName}`);
      const updatedPanelsList = [...panelsList];
      const newPanelMetadata = { id: uuidv4(), name: panelName };
      updatedPanelsList.push(newPanelMetadata);
      setPanelsList(updatedPanelsList);
      return newPanelMetadata;
    }
  }

  function deletePanel(panelToDelete) {
    if (
      window.confirm(
        `Are you sure that you want to delete panel ${panelToDelete.name}?`
      )
    ) {
      console.log(`Deleting panel ${panelToDelete.name} (${panelToDelete.id})`);
      if (
        selectedTab === panelsList.length - 1 &&
        panelsList[selectedTab].id === panelToDelete.id
      ) {
        setSelectedTab(0);
      }
      const updatedPanelsList = panelsList.filter(
        (panel) => panel.id !== panelToDelete.id
      );
      setPanelsList(updatedPanelsList);
    }
  }

  return (
    <Container fixed maxWidth="sm">
      <PanelTabs
        createPanel={createPanel}
        deletePanel={deletePanel}
        panelsList={panelsList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {panelsList.map((panelData, index) =>
        selectedTab === index ? (
          <Panel
            key={panelData.id}
            data={panelData}
            updatePanelMetadata={(updates) =>
              updatePanelMetadata({
                panelId: panelData.id,
                updates,
              })
            }
          />
        ) : null
      )}
    </Container>
  );
}

function PanelTabs({
  createPanel,
  deletePanel,
  panelsList,
  selectedTab = 0,
  setSelectedTab,
}) {
  const [newPanelName, setNewPanelName] = useState('');

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            {panelsList.map((panel) => {
              return (
                <Tab
                  key={panel.name}
                  onMouseDown={(event) => {
                    if (
                      event.button === 1 ||
                      (event.button === 0 && event.shiftKey)
                    ) {
                      deletePanel(panel);
                    }
                    //  else if (event.button === 0) {
                    //   handleOnClick(task);
                    // }
                  }}
                  label={
                    <Box
                      sx={{
                        // display: 'flex',
                        // flexWrap: 'wrap',
                        // '& > :not(style)': {
                        // m: 1,
                        // width: 128,
                        // height: 100,
                        // },
                        marginTop: '2px',
                      }}
                    >
                      <Box>{panel.name}</Box>
                      <Box>
                        <LinearProgressWithLabel
                          // color={color.yellow}
                          hidelabel={1}
                          size={'s'}
                          value={panel.progress || 0}
                        />
                      </Box>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Grid>
        <Grid item xs={3}>
          <Box
            sx={{
              marginTop: '10px',
              // display: 'flex',
              // justifyContent: 'right',
              // alignContent: 'right',
            }}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const newPanelMetadata = createPanel(newPanelName);
                if (newPanelMetadata) {
                  setNewPanelName('');
                }
              }}
            >
              <TextField
                onChange={(event) => setNewPanelName(event.target.value)}
                label="Add Panel"
                sx={{ width: '100%' }}
                size="small"
                value={newPanelName}
              />
            </form>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={PanelsCluster} />
      </Switch>
    </Router>
  );
}
