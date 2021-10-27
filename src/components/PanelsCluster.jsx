import { v4 as uuidv4 } from 'uuid';

import Container from '@mui/material/Container';

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
    // debounce: 400,
    defaultValue: [],
    dbPath: `panels/${user}`,
  });
  const [selectedTab, setSelectedTab] = useLocalStorageState({
    defaultValue: 0,
    key: `tasks:selected-tab`,
  });

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
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
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
            database={database}
            data={panelData}
            key={panelData.id}
            updatePanelMetadata={(updates) =>
              updatePanelMetadata({
                panelId: panelData.id,
                updates,
              })
            }
            user={user}
          />
        ) : null
      )}
    </Container>
  );
}
