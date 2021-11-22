// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';

export default function ViewSelector({
  masonryView,
  setMasonryView,
  setStacksCount,
  stacksCount = 2,
}) {
  return (
    <>
      <ToggleButtonGroup
        size="small"
        orientation="horizontal"
        value={masonryView ? 1 : null}
        exclusive
        onChange={(event, newValue) => {
          setMasonryView(Boolean(newValue));
        }}
        sx={{ paddingRight: '10px', height: '40px' }}
      >
        <ToggleButton
          key={1}
          sx={{
            borderColor: 'rgb(196,196,196)',
            color: 'rgb(102,102,102)',
            minWidth: '45px',
          }}
          disableRipple
          value={1}
          aria-label="list"
        >
          <ViewComfyIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      {!masonryView ? (
        <ToggleButtonGroup
          size="small"
          // orientation="vertical"
          orientation="horizontal"
          value={stacksCount}
          exclusive
          onChange={(event, newValue) => {
            setStacksCount(newValue);
          }}
          sx={{ paddingRight: '10px', height: '40px' }}
        >
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
            {/* <ViewWeekIcon fontSize="small" /> */}
            <ViewColumnIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      ) : null}
    </>
  );
}
