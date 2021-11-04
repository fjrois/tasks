import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';

const higherElevation = 8;

export default function ListItem({
  backgroundColor,
  defaultElevation,
  deleteTask,
  handleOnClick,
  isMobile,
  moveTaskLeft,
  moveTaskRight,
  moveTaskToPanel,
  task,
}) {
  const [elevation, setElevation] = useState(defaultElevation);
  const [showArrows, setShowArrows] = useState(false);

  // let clickStartMs;
  return (
    <Paper
      // variant={'outlined'}
      sx={{
        backgroundColor,
        color: 'text.secondary',
        // cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 90,
        padding: '16px 8px 16px 8px',
        textAlign: 'center',
        borderRadius: 2,
      }}
      elevation={elevation}
      key={task.id}
      // onMouseDown={(event) => {
      //   clickStartMs = Date.now();
      // }}
      onMouseUp={(event) => {
        // const clickTimeMs = Date.now() - clickStartMs;
        // if (clickTimeMs > 600) {
        //   deleteTask(task);
        // } else {
        if (
          !isMobile &&
          (event.button === 1 || (event.button === 0 && event.shiftKey))
        ) {
          deleteTask(task);
        }
        // else if (event.button === 0) {
        //   handleOnClick(task);
        // }
      }}
      // onClick={() => handleOnClick(task)}
      onMouseOver={() => {
        setElevation(higherElevation);
        setShowArrows(true);
      }}
      onMouseLeave={() => {
        setElevation(defaultElevation);
        setShowArrows(false);
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // alightItems: 'center',
        }}
      >
        {true ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <IconButton
              size="small"
              aria-label="move left"
              disabled={!moveTaskLeft}
              onClick={() => (moveTaskLeft ? moveTaskLeft(task) : null)}
            >
              <ArrowBackIosIcon
                sx={{ color: showArrows ? '' : 'transparent' }}
                fontSize="10"
              />
            </IconButton>
          </Box>
        ) : null}

        <Box>
          <Box>{task?.title || null}</Box>
          {task?.topic?.name ? (
            <Box sx={{ paddingTop: '7px' }}>
              <b>{`[${task.topic.name}] `}</b>
            </Box>
          ) : null}
        </Box>

        {true ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <IconButton
              size="small"
              aria-label="move right"
              disabled={!moveTaskRight}
              onClick={() => (moveTaskRight ? moveTaskRight(task) : null)}
            >
              <ArrowForwardIosIcon
                sx={{ color: showArrows ? '' : 'transparent' }}
                fontSize="10"
              />
            </IconButton>
          </Box>
        ) : null}
      </Box>
      {/* <button onClick={() => moveTaskToPanel(task)}> NEXT</button> */}
    </Paper>
  );
}
