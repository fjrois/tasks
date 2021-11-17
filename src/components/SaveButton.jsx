import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

export default function SaveButton({ saveData, saveStatus }) {
  let color = 'primary';
  let buttonDisabled = false;

  switch (saveStatus) {
    case 'up-to-date':
      color = 'success';
      buttonDisabled = true;
      break;
    case 'unsaved-changes':
      color = 'warning';
      break;
    case 'saving':
      color = 'warning';
      buttonDisabled = true;
      break;
    case 'failed-to-save':
      color = 'error';
      break;
    default:
      break;
  }

  let tooltipTitle = saveStatus.split('-').join(' ');
  tooltipTitle = tooltipTitle.charAt(0).toUpperCase() + tooltipTitle.slice(1);
  return (
    <>
      <Tooltip
        title={tooltipTitle}
        disableFocusListener={!saveStatus}
        disableHoverListener={!saveStatus}
      >
        <IconButton
          aria-label="save"
          size="small"
          color={color}
          sx={{ cursor: buttonDisabled ? 'initial' : '' }}
          onClick={buttonDisabled ? () => {} : saveData}

          // sx={{
          //   IconButton: {
          //     '&:disabled': {
          //       backgroundColor: 'primary' || 'red',
          //     },
          //   },
          // }}
        >
          {getStatusIcon({ saveStatus })}
        </IconButton>
      </Tooltip>
      {/* </Fab> */}
      {saveStatus === 'saving' && (
        <CircularProgress
          size={25}
          sx={{
            color: 'success.main',
            position: 'absolute',
            top: 1,
            left: 1,
            // zIndex: 1,
          }}
        />
      )}
    </>
  );
}

function getStatusIcon({ saveStatus, size }) {
  switch (saveStatus) {
    case 'up-to-date':
      return <CheckIcon fontSize="inherit" />;
    case 'unsaved-changes':
      return <SaveIcon fontSize="inherit" />;
    default:
      return <SaveIcon fontSize="inherit" />;
  }
}
