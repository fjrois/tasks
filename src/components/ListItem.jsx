import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemActionsButton from './ListItemActionsButton';
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
  moveTaskToNextPanel,
  moveTaskToPreviousPanel,
  removeTaskFromPanel,
  task,
}) {
  const [elevation, setElevation] = useState(defaultElevation);
  const [showIcons, setShowIcons] = useState(false);

  // let clickStartMs;
  return (
    <Paper
      // variant={'outlined'}
      sx={{
        backgroundColor,
        color: 'text.secondary',
        cursor: handleOnClick ? 'pointer' : '',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 90,
        padding: '16px 8px 16px 8px',
        textAlign: 'center',
        borderRadius: 2,
        position: 'relative',
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
          deleteTask &&
          (event.button === 1 || (event.button === 0 && event.shiftKey))
        ) {
          deleteTask(task);
        } else if (handleOnClick && event.button === 0) {
          handleOnClick(task);
        }
      }}
      // onClick={() => handleOnClick(task)}
      onMouseOver={() => {
        setElevation(higherElevation);
        setShowIcons(true);
      }}
      onMouseLeave={() => {
        setElevation(defaultElevation);
        setShowIcons(false);
      }}
    >
      {deleteTask || moveTaskToNextPanel || moveTaskToPreviousPanel ? (
        <Box position="absolute" top="8%" right="5%">
          <ListItemActionsButton
            color={showIcons ? '' : 'transparent'}
            deleteTask={deleteTask ? () => deleteTask(task) : null}
            moveTaskToNextPanel={
              moveTaskToNextPanel ? () => moveTaskToNextPanel(task) : null
            }
            moveTaskToPreviousPanel={
              moveTaskToPreviousPanel
                ? () => moveTaskToPreviousPanel(task)
                : null
            }
            removeTaskFromPanel={
              removeTaskFromPanel ? () => removeTaskFromPanel(task) : null
            }
          />
        </Box>
      ) : null}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // alightItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <IconButton
            disableRipple
            size="small"
            aria-label="move left"
            disabled={!moveTaskLeft}
            onClick={() => (moveTaskLeft ? moveTaskLeft(task) : null)}
          >
            <ArrowBackIosNewIcon
              sx={{
                color: showIcons && moveTaskLeft ? '' : 'transparent',
              }}
              fontSize="10"
            />
          </IconButton>
        </Box>

        <Box
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Box>{task?.title || null}</Box>
          {task?.topic?.name ? (
            <Box
              sx={{
                paddingTop: '7px',
              }}
            >
              <b>{`[${task.topic.name}] `}</b>
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <IconButton
            disableRipple
            size="small"
            aria-label="move right"
            disabled={!moveTaskRight}
            onClick={() => (moveTaskRight ? moveTaskRight(task) : null)}
          >
            <ArrowForwardIosIcon
              sx={{ color: showIcons && moveTaskRight ? '' : 'transparent' }}
              fontSize="10"
            />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
