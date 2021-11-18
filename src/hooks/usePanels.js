import { v4 as uuidv4 } from 'uuid';

import { useMemo, useState } from 'react';
import { objectToList } from '../utils.js';

export default function usePanels({
  defaultValue = {},
  selectedTab,
  setConfettiedPanels,
  setSelectedTab,
  setUnsavedChanges,
}) {
  const [panels, setPanels] = useState(defaultValue);

  const panelsList = useMemo(() => {
    if (!panels) return [];
    console.log('Recalculating panelsList...');
    const newValue = objectToList(panels).sort(
      (panel1, panel2) => panel1.dateCreated - panel2.dateCreated
    );
    console.log('panelsList newValue:', newValue);
    return newValue;
  }, [panels]);

  function addPanel(panelName, panelData) {
    if (
      panels &&
      Object.values(panels).find(
        (panel) => panel.name.toLowerCase() === panelName.toLowerCase()
      )
    ) {
      console.log(`There is already a panel with the name ${panelName}`);
    } else {
      console.log(`Adding panel ${panelName}`);

      const dateNow = Date.now();
      let newPanelMetadata = {
        id: `panel-${uuidv4()}`,
        name: panelName,
        progress: { real: 0, potential: 0 },
        dateCreated: dateNow,
        dateModified: dateNow,
        dateDeleted: 0,
      };

      // Use panel data if provided as argument
      if (panelData) {
        newPanelMetadata = { ...newPanelMetadata, ...panelData };
      }

      setPanels((panels) => {
        const updatedPanels = { ...panels };
        updatedPanels[newPanelMetadata.id] = newPanelMetadata;
        return updatedPanels;
      });
      setUnsavedChanges((unsavedChanges) => {
        const newUpdatedItems = { ...unsavedChanges };
        newUpdatedItems['panels'][newPanelMetadata.id] = newPanelMetadata;
        return newUpdatedItems;
      });
      return true;
    }
  }

  function deletePanel(panelToDelete) {
    if (
      window.confirm(
        `Are you sure that you want to delete panel ${panelToDelete.name}?`
      )
    ) {
      console.log(`Deleting panel ${panelToDelete.name} (${panelToDelete.id})`);

      if (panelsList.length > 1 && selectedTab > 0) {
        setSelectedTab(selectedTab - 1);
      }

      updatePanel({
        panelId: panelToDelete.id,
        updates: { dateDeleted: Date.now() },
      });
      setConfettiedPanels((confettiedPanels) =>
        confettiedPanels.filter((panelId) => panelId !== panelToDelete.id)
      );
    }
    return true;
  }

  function updatePanel({ panelId, updates }) {
    if (!panelId || !updates || !Object.keys(updates).length) return;

    setPanels((panels) => {
      const panelToUpdate = panels[panelId];
      if (!panelToUpdate) {
        console.log(`Panel ${panelId} can't be updated. It doesn't exist`);
        return panels;
      } else {
        const updatedPanels = { ...panels };
        const updatedPanel = {
          ...panelToUpdate,
          ...updates,
          dateModified: Date.now(),
        };
        updatedPanels[panelId] = updatedPanel;

        setUnsavedChanges((unsavedChanges) => {
          const newUpdatedItems = { ...unsavedChanges };
          newUpdatedItems['panels'][panelId] = updatedPanel;
          return newUpdatedItems;
        });
        return updatedPanels;
      }
    });
    return true;
  }

  return { panels, panelsList, setPanels, addPanel, updatePanel, deletePanel };
}
