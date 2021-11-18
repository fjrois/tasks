import Box from '@mui/material/Box';

import ListItem from './ListItem';

export default function AllTasksView({ tasksList, moveTaskToSelectedPanel }) {
  const sortedTasksList = tasksList
    ? [...tasksList].sort(
        (task1, task2) => task2.dateCreated - task1.dateCreated
      )
    : [];

  return (
    <>
      <Box
        display="flex"
        flexWrap="wrap"
        // justifyContent="space-between"
        columnGap="16px"
        rowGap="10px"
      >
        {sortedTasksList.map((task) => {
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
    </>
  );
}

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
