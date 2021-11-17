import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function ListItemActionsButton({
  color,
  deleteTask,
  moveTaskToNextPanel,
  moveTaskToPreviousPanel,
  removeTaskFromPanel,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="actions-button"
        disableRipple
        size="small"
        aria-label="show options"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreHorizIcon
          sx={{
            color,
          }}
          fontSize="10"
        />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        {moveTaskToNextPanel ? (
          <MenuItem onClick={moveTaskToNextPanel}>
            <ListItemIcon>
              <ArrowForwardIcon fontSize="small" />
            </ListItemIcon>
            Move to next panel
          </MenuItem>
        ) : null}
        {moveTaskToPreviousPanel ? (
          <MenuItem onClick={moveTaskToPreviousPanel}>
            <ListItemIcon>
              <ArrowBackIcon fontSize="small" />
            </ListItemIcon>
            Move to previous panel
          </MenuItem>
        ) : null}
        {removeTaskFromPanel ? (
          <MenuItem onClick={removeTaskFromPanel}>
            <ListItemIcon>
              <RemoveCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            Remove from panel
          </MenuItem>
        ) : null}
        {deleteTask ? (
          <MenuItem onClick={deleteTask}>
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        ) : null}
      </Menu>
    </div>
  );
}
