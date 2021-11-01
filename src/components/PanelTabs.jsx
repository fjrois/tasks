import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import LinearProgressWithLabel from './progress/LinearProgressWithLabel.jsx';

export default function PanelTabs({
  createPanel,
  deletePanel,
  panelsList,
  selectedTab = 0,
  setSelectedTab,
  userId,
}) {
  const [newPanelName, setNewPanelName] = useState('');
  const anonymousUserPanelsMaxReached = !userId && panelsList.length === 1;

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
            {panelsList
              ? panelsList.map((panel) => {
                  return (
                    <Tab
                      // disableRipple
                      // disableFocusRipple
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
                          sx={
                            {
                              // display: 'flex',
                              // flexWrap: 'wrap',
                              // '& > :not(style)': {
                              // m: 1,
                              // width: 128,
                              // height: 100,
                              // },
                              // marginTop: '2px',
                            }
                          }
                        >
                          <Box>{panel.name}</Box>
                          <Box>
                            <LinearProgressWithLabel
                              color={getProgressColor(panel.progress)}
                              hidelabel={1}
                              size={'s'}
                              value={panel.progress || 0}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  );
                })
              : null}
          </Tabs>
        </Grid>
        <Grid item xs={3}>
          <Box
            sx={{
              // paddingTop: '10px',
              marginTop: '8px',
              // backgroundColor: 'purple',
              // display: 'flex',
              // justifyContent: 'right',
              // alignContent: 'right',
            }}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const newPanelIndex = createPanel(newPanelName);
                if (newPanelIndex > -1) {
                  setSelectedTab(newPanelIndex);
                  setNewPanelName('');
                }
              }}
            >
              <Tooltip
                disableFocusListener={!anonymousUserPanelsMaxReached}
                disableHoverListener={!anonymousUserPanelsMaxReached}
                disableTouchListener={!anonymousUserPanelsMaxReached}
                title="Log in to create more panels"
              >
                <TextField
                  disabled={anonymousUserPanelsMaxReached}
                  onChange={(event) => setNewPanelName(event.target.value)}
                  label="Add Panel"
                  sx={{ width: '100%' }}
                  size="small"
                  value={newPanelName}
                />
              </Tooltip>
            </form>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

function getProgressColor(progress) {
  if (!progress || progress < 60) return 'error';
  if (progress < 85) return 'warning';
  return 'primary';
}
