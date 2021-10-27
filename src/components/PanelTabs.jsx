import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';

import LinearProgressWithLabel from './progress/LinearProgressWithLabel.jsx';

export default function PanelTabs({
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
