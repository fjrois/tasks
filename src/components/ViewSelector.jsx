// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ViewSelector({ setStacksCount, stacksCount = 2 }) {
  return (
    <ToggleButtonGroup
      size="small"
      // orientation="vertical"
      orientation="horizontal"
      value={stacksCount}
      exclusive
      onChange={(event, newValue) => {
        setStacksCount(newValue);
      }}
    >
      <ToggleButton
        key={2}
        sx={{
          borderColor: 'rgb(196,196,196)',
          color: 'rgb(102,102,102)',
          minWidth: '45px',
        }}
        disableRipple
        value={2}
        aria-label="list"
      >
        {/* <ArrowForwardIcon /> */}
        {2}
      </ToggleButton>
      <ToggleButton
        key={3}
        sx={{
          borderColor: 'rgb(196,196,196)',
          color: 'rgb(102,102,102)',
          minWidth: '45px',
        }}
        disableRipple
        value={3}
        aria-label="list"
      >
        {/* <ArrowForwardIcon /> */}
        {3}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}