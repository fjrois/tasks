import Box from '@mui/material/Box';

import ListItem from './ListItem';

export default function AllTasksView({ tasksList, moveTaskToSelectedPanel }) {
  function getBackgroundColor(status) {
    switch (status) {
      case 'doing':
        return 'warning.main';
      case 'done':
        return 'success.main';
      default:
        return 'warning.light';
    }
  }

  return (
    <>
      {tasksList ? (
        <Box
          display="flex"
          flexWrap="wrap"
          // justifyContent="space-between"
          columnGap="16px"
          rowGap="10px"
        >
          {tasksList.map((task) => {
            return (
              <Box key={task.id} width="200px">
                <ListItem
                  backgroundColor={getBackgroundColor(task.status)}
                  handleOnClick={
                    moveTaskToSelectedPanel
                      ? () => {
                          moveTaskToSelectedPanel(task);
                        }
                      : null
                  }
                  task={task}
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </>
  );
}
