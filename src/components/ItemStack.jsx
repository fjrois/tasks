import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Stack from '@mui/material/Stack';

import ListItem from './ListItem';

const colors = {
  green: '#91ff9a',
  yellow: '#ffff8a',
  orange: '#ffed7a',
};

export default function ItemStack({
  handleItemClick,
  handleItemMiddleClick,
  moveTaskToPanel,
  list = [],
  type: listType,
}) {
  const defaultElevation = 1;
  const checked = true;

  let itemBackgroundColor, title;
  if (listType === 'done') {
    itemBackgroundColor = colors.green;
    title = 'Done';
  } else if (listType === 'todo') {
    itemBackgroundColor = colors.yellow;
    title = 'To do';
  } else if (listType === 'doing') {
    itemBackgroundColor = colors.orange;
    title = 'Doing';
  }

  // const loadedListRef = useRef(list.length === 0 ? [] : [list[0]]);

  // useEffect(() => {
  //   console.log('loadedListRef.current:', loadedListRef.current);
  //   if (loadedListRef.current.length < list) {
  //     loadedListRef.current = [
  //       ...loadedListRef.current,
  //       list[loadedListRef.current.length + 1],
  //     ];
  //   }
  // });

  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    setFirstRender(false);
  }, []);

  return (
    <Box>
      <Box
        sx={{
          // display: 'flex',
          // flexWrap: 'wrap',
          '& > :not(style)': {
            m: 1,
            // width: 128,
            height: 28,
            textAlign: 'center',
          },
          color: 'text.secondary',
        }}
      >
        <h3>{title.toUpperCase()}</h3>
      </Box>
      <Stack spacing={2}>
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
              <span>
                <ListItem
                  backgroundColor={itemBackgroundColor}
                  defaultElevation={defaultElevation}
                  handleOnClick={() => handleItemClick(task)}
                  handleItemMiddleClick={() => handleItemMiddleClick(task)}
                  moveTaskToPanel={moveTaskToPanel}
                  task={task}
                />
              </span>
            </Grow>
          );
        })}
      </Stack>
    </Box>
  );
}
