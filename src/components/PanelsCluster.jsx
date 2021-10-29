import { v4 as uuidv4 } from 'uuid';

import Container from '@mui/material/Container';
import { ref, update } from 'firebase/database';

import Panel from './Panel.jsx';
import PanelTabs from './PanelTabs.jsx';
import useDatabaseState from '../hooks/useDatabaseState.js';
import useLocalStorageState from '../hooks/useLocalStorageState.js'; // TODO: use this when no connectivity

export default function PanelsCluster({ database, user }) {
  // const [panelsList, setPanelsList] = useLocalStorageState({
  //   debounce: 400,
  //   key: 'panelsList',
  //   defaultValue: [
  //     // { id: 'id1', name: 'Panel 1' },
  //     // { id: 'id2', name: 'Panel 2' },
  //     // { id: 'id3', name: 'Panel 3' },
  //   ],
  // });
  const [panelsList, setPanelsList] = useDatabaseState({
    database,
    dbPath: `panels/${user}`,
    // debounce: 400,
    defaultValue: [],
    // defaultValue: [{ id: 'all', name: 'all' }],
  });

  const [selectedTab, setSelectedTab] = useLocalStorageState({
    defaultValue: 0,
    key: `tasks:selected-tab`,
  });

  const selectedPanelId = panelsList ? panelsList[selectedTab]?.id : undefined;
  const dbPath = `/lists/${user}/${selectedPanelId}`;
  // let dbPath;
  // switch (selectedPanelId) {
  //   case 'all':
  //     dbPath = `/lists/${user}`;
  //     break;
  //   default:
  //     dbPath = `/lists/${user}/${selectedPanelId}`;
  // }
  // console.log('dbPath:', dbPath);
  const [tasksList, setTasksList] = useDatabaseState({
    database,
    dbPath,
    // debounce: 200,
    defaultValue: [],
  });
  // console.log('tasksList:', tasksList);

  // const [tasksList, setTasksList] = useState([]);

  // useEffect(() => {
  //   if (!dbPath || dbPath.includes('undefined')) return;
  //   console.log('AQUI dbPath changed:', dbPath);
  //   // Subscribe to db changes
  //   const stateRef = ref(database, dbPath);
  //   const calcelSubscription = onValue(stateRef, (snapshot) => {
  //     // const updatedState = snapshot.val() || [];
  //     const updatedState = snapshot.val();
  //     if (!updatedState) return;
  //     console.log(
  //       `AQUI New value from database. Updating local ${dbPath}: ${JSON.stringify(
  //         updatedState
  //       )}`
  //     );
  //     setTasksList(updatedState);
  //   });
  //   return () => {
  //     console.log('AQUI calcelSubscription:', calcelSubscription);
  //     calcelSubscription();
  //     setTasksList(null);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dbPath]);

  // useEffect(() => {
  //   if (!tasksList || dbPath.includes('undefined')) return;
  //   console.log('AQUI2 dbPath:', dbPath);
  //   console.log('AQUI2 tasksList:', tasksList);
  //   //   console.log('HERE1 dbPath:', dbPath);
  //   //   console.log('HERE1 state:', state);
  //   //   if (state && JSON.stringify(state) !== JSON.stringify(defaultValue)) {
  //   //     // Update db
  //   const updates = {};
  //   updates[dbPath] = tasksList;
  //   console.log(`Updating ${dbPath}: ${JSON.stringify(updates)}`);
  //   update(ref(database), updates);
  //   //   }
  //   // return () => {
  //   // };
  // }, [database, tasksList]);

  // PANEL OPERATIONS
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
      panelsList &&
      panelsList.find(
        (panel) => panel.name.toLowerCase() === panelName.toLowerCase()
      )
    ) {
      console.log(`There is already a panel with the name ${panelName}`);
    } else {
      console.log(`Creating panel ${panelName}`);
      const updatedPanelsList = panelsList ? [...panelsList] : [];
      const newPanelMetadata = { id: `panel-${uuidv4()}`, name: panelName };
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

  function moveTaskToPanel({ task, originPanelIndex, targetPanelIndex }) {
    if (!targetPanelIndex || targetPanelIndex >= panelsList.length)
      return false;

    // Update target panel tasks
    const targetPanel = panelsList[targetPanelIndex];
    const tasksTarget = []; // TODO: fetch real values
    const updatedTasksTarget = [...tasksTarget, task];
    const dbPathTarget = `lists/${user}/${targetPanel.id}`;

    //Update origin panel tasks
    const originPanel = panelsList[originPanelIndex];
    const tasksOrigin = []; // TODO: fetch real values
    const updatedTasksOrigin = tasksOrigin.filter(
      (originTask) => originTask.id !== task.id
    );
    const dbPathOrigin = `lists/${user}/${originPanel.id}`;

    const updates = {};
    updates[dbPathTarget] = updatedTasksTarget;
    updates[dbPathOrigin] = updatedTasksOrigin;
    console.log(
      `Updating ${dbPathTarget}: ${JSON.stringify(updatedTasksTarget)}`
    );
    console.log(
      `Updating ${dbPathOrigin}: ${JSON.stringify(updatedTasksOrigin)}`
    );
    update(ref(database), updates);
  }

  // TASK OPERATIONS
  function createTask(taskTitle) {
    const foundTask = findTaskTitle(taskTitle);
    if (foundTask) {
      console.log(
        `There is already a task with the title ${taskTitle} in the '${foundTask.status}' list`
      );
    } else {
      console.log(`Creating task ${taskTitle}`);
      const task = {
        dateCreated: Date.now(),
        id: uuidv4(),
        status: 'todo',
        title: taskTitle,
      };
      console.log('task:', task);
      setTasksList((tasksList) => (tasksList ? [...tasksList, task] : [task]));
      return task;
    }
  }

  function deleteTask(taskToDelete) {
    console.log(`Deleting task "${taskToDelete.title}" (${taskToDelete.id})`);
    setTasksList((tasksList) =>
      tasksList.filter((task) => task.id !== taskToDelete.id)
    );
  }

  function findTaskTitle(taskTitle) {
    if (!tasksList) return false;
    const foundTask = tasksList.find(
      (task) => task?.title?.toLowerCase() === taskTitle.toLowerCase()
    );
    return foundTask;
  }

  function updateTask(taskToUpdate, updates = {}) {
    console.log(
      `Updating task "${taskToUpdate.title}" (${
        taskToUpdate.id
      }): ${JSON.stringify(updates)}`
    );

    setTasksList((tasksList) => {
      const foundTaskIndex = tasksList.findIndex(
        (task) => task.id === taskToUpdate.id
      );
      if (foundTaskIndex === -1) {
        console.log(
          `Task ${taskToUpdate.title} (${taskToUpdate.id}) doesn't seem to exist in this panel`
        );
        return tasksList;
      }
      const foundTask = tasksList[foundTaskIndex];
      const updatedTask = { ...foundTask, ...updates };
      const updatedTasksList = [...tasksList];
      updatedTasksList[foundTaskIndex] = updatedTask;
      return updatedTasksList;
    });
  }

  // function objectToArray(obj) {
  //   if (!obj) return [];
  //   return Object.values(obj).reduce((previousValue, currentValue) => {
  //     return [...previousValue, ...currentValue];
  //   }, []);
  // }

  return (
    <Container fixed maxWidth="sm">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
      <PanelTabs
        createPanel={createPanel}
        deletePanel={deletePanel}
        panelsList={panelsList || []}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {panelsList
        ? panelsList.map((panelData, index) =>
            selectedTab === index ? (
              <Panel
                // allowInput={selectedPanelId !== 'all'}
                createTask={createTask}
                database={database}
                data={panelData}
                deleteTask={deleteTask}
                key={panelData.id}
                moveTaskToPanel={(task) =>
                  moveTaskToPanel({
                    task,
                    originPanelIndex: index,
                    targetPanelIndex: index + 1,
                  })
                }
                tasksList={tasksList}
                // tasksList={
                //   selectedPanelId !== 'all'
                //   tasksList
                //   Array.isArray(tasksList)
                //     ? tasksList
                //     : objectToArray(tasksList)
                // }
                updatePanelMetadata={(updates) =>
                  updatePanelMetadata({
                    panelId: panelData.id,
                    updates,
                  })
                }
                updateTask={updateTask}
                user={user}
              />
            ) : null
          )
        : null}
    </Container>
  );
}
