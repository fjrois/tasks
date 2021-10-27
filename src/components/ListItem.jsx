import Paper from '@mui/material/Paper';
import React, { useEffect, useState } from 'react';

export default function ListItem({
  backgroundColor,
  defaultElevation,
  handleItemMiddleClick,
  handleOnClick,
  icon = '',
  task,
}) {
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
}
