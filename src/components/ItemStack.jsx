import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import {
  // SwipeableList,
  SwipeableListItem,
} from '@sandstreamdev/react-swipeable-list';
// import '@sandstreamdev/react-swipeable-list/dist/styles.css';

import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Stack from '@mui/material/Stack';

import ListItem from './ListItem';

export default function ItemStack({
  deleteTask,
  list = [],
  moveTaskLeft,
  moveTaskRight,
  moveTaskToNextPanel,
  moveTaskToPreviousPanel,
  removeTaskFromPanel,
  showDoingStack,
  type: listType,
}) {
  const defaultElevation = 1;
  const checked = true;

  let itemBackgroundColor, title;
  if (listType === 'done') {
    itemBackgroundColor = 'success.main';
    title = 'Done';
  } else if (listType === 'todo') {
    itemBackgroundColor = 'warning.light';
    title = 'To do';
  } else if (listType === 'doing') {
    itemBackgroundColor = 'warning.main';
    title = 'Doing';
  }

  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    setFirstRender(false);
  }, []);

  const listItemReady = (task) => {
    return (
      <ListItem
        backgroundColor={itemBackgroundColor}
        defaultElevation={defaultElevation}
        deleteTask={() => deleteTask(task)}
        isMobile={isMobile}
        moveTaskLeft={moveTaskLeft}
        moveTaskRight={moveTaskRight}
        moveTaskToNextPanel={moveTaskToNextPanel}
        moveTaskToPreviousPanel={moveTaskToPreviousPanel}
        removeTaskFromPanel={removeTaskFromPanel}
        task={task}
      />
    );
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box
        sx={{
          '& > :not(style)': {
            m: 1,
            height: 28,
            textAlign: 'center',
          },
          color: 'text.secondary',
        }}
      >
        <h3>{title.toUpperCase()}</h3>
      </Box>
      <Stack width="92%" minWidth="85px" maxWidth="300px" spacing={2}>
        {/* {loadedListRef.current.map((task) => ( */}
        {list.map((task, index) => {
          return (
            <Grow
              in={checked}
              key={task.id}
              // enter
              // appear
              // mountOnEnter
              style={{
                transformOrigin: '0 0 0',
                transitionDelay: firstRender ? '200ms' : '0ms',
              }}
              {...(checked ? { timeout: firstRender ? 1000 : 200 } : {})}
            >
              <div>
                {isMobile &&
                (task.status === 'todo' ||
                  (task.status === 'doing' && !showDoingStack)) ? (
                  <SwipeableListItem
                    swipeLeft={{
                      // content: <div>Revealed content during swipe</div>,
                      content: '',
                      action: () => {
                        deleteTask(task);
                      },
                    }}
                  >
                    {listItemReady(task)}
                  </SwipeableListItem>
                ) : (
                  listItemReady(task)
                )}
              </div>
            </Grow>
          );
        })}
      </Stack>
    </Box>
  );
}
