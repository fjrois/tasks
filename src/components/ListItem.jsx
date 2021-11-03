import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';

export default function ListItem({
  backgroundColor,
  defaultElevation,
  deleteTask,
  handleOnClick,
  isMobile,
  moveTaskToPanel,
  task,
}) {
  const [elevation, setElevation] = useState(defaultElevation);
  const higherElevation = 8;

  // let clickStartMs;
  return (
    <Paper
      // variant={'outlined'}
      sx={{
        backgroundColor,
        color: 'text.secondary',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 65,
        padding: '16px',
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
        } else if (event.button === 0) {
          handleOnClick(task);
        }
        // }
      }}
      // onPress={() => handleOnDoubleClick(task)}
      // onClick={() => handleOnClick(task)}
      onMouseEnter={() => setElevation(higherElevation)}
      onMouseLeave={() => setElevation(defaultElevation)}
    >
      <Box>{task?.title || null}</Box>
      {task?.topic?.name ? (
        <Box sx={{ paddingTop: '7px' }}>
          <b>{`[${task.topic.name}] `}</b>
        </Box>
      ) : null}
      {/* <button onClick={() => moveTaskToPanel(task)}> NEXT</button> */}
    </Paper>
  );
}
