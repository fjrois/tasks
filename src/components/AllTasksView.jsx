import Box from '@mui/material/Box';

import Masonry from 'react-masonry-css';

import ListItem from './ListItem';

import './AllTasksView.css';

export default function AllTasksView({ tasksList, moveTaskToSelectedPanel }) {
  const sortedTasksList = tasksList
    ? [...tasksList].sort(
        (task1, task2) => task2.dateCreated - task1.dateCreated
      )
    : [];

  return (
    <>
      <Masonry
        breakpointCols={{
          default: 4,
          846: 3,
          641: 2,
          428: 1,
        }}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {sortedTasksList.map((task) => {
          return (
            <Box key={task.id}>
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
      </Masonry>
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
