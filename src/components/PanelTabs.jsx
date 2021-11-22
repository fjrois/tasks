import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';

export default function PanelTabs({
  addPanel,
  allPanelsView,
  deletePanel,
  panelsList,
  selectedTab = 0,
  setAllPanelsView,
  setMasonryView,
  setSelectedTab,
  userId,
}) {
  const [newPanelName, setNewPanelName] = useState('');
  const anonymousUserPanelsMaxReached = !userId && panelsList.length === 1;

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={1.5} sx={{ marginTop: '6px' }}>
          <Box display="flex" justifyContent="center">
            <ToggleButton
              sx={{
                borderColor: 'rgb(196,196,196)',
                marginTop: '2px',
                marginLeft: '6px',
                maxHeight: '40px',
              }}
              // value="check"
              selected={allPanelsView}
              onChange={() => {
                setAllPanelsView((allPanelsView) => {
                  const updatedAllPanelsView = !allPanelsView;
                  const updtatedMasonryView = updatedAllPanelsView;
                  setMasonryView(updtatedMasonryView);
                  return updatedAllPanelsView;
                });
                setSelectedTab(panelsList.length - 1);
              }}
            >
              ALL
            </ToggleButton>
          </Box>
        </Grid>
        {allPanelsView ? (
          <Grid item xs={10.5} />
        ) : (
          <>
            <Grid item xs={7.5}>
              <Tabs
                sx={{ paddingRight: '8px' }}
                value={selectedTab}
                onChange={(event, newValue) => setSelectedTab(newValue)}
                variant="scrollable"
                // scrollButtons="auto"
                scrollButtons={false}
                aria-label="scrollable auto tabs"
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
                          // label={
                          //   <Box
                          //     sx={
                          //       {
                          //         // display: 'flex',
                          //         // flexWrap: 'wrap',
                          //         // '& > :not(style)': {
                          //         // m: 1,
                          //         // width: 128,
                          //         // height: 100,
                          //         // },
                          //         // marginTop: '2px',
                          //       }
                          //     }
                          //   >
                          //     <Box>{panel.name}</Box>
                          //     <Box>
                          //       <LinearProgressWithLabel
                          //         color={getProgressColor(panel.progress)}
                          //         hideLabel={1}
                          //         size={'s'}
                          //         value={panel.progress || 0}
                          //       />
                          //     </Box>
                          //   </Box>
                          // }
                          label={panel.name}
                        />
                      );
                    })
                  : null}
              </Tabs>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  paddingLeft: '10px',
                  marginTop: '8px',
                }}
              >
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const newPanelIndex = panelsList.length;
                    const addingPanel = addPanel(newPanelName);

                    if (addingPanel) {
                      setNewPanelName('');
                      setSelectedTab(newPanelIndex);
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
          </>
        )}
      </Grid>
    </>
  );
}
