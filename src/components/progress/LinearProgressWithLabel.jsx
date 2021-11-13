import * as React from 'react';
// import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LinearProgressWithLabel(props) {
  const { hidelabel: hideLabel, progress, size, value, width } = props;
  const { real: realProgress = 0, potential: potentialProgress = 0 } = progress;
  const height = '5px';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: width ? `${width}%` : '100%',
          mr: hideLabel ? 0 : 1,
        }}
      >
        <LinearProgress
          color={'success'}
          variant="determinate"
          sx={{
            backgroundColor: 'transparent',
            height,
            borderRadius: '40px',
            // width: '200px',
          }}
          {...props}
          value={realProgress}
        />
        <LinearProgress
          color={'warning'}
          variant="determinate"
          sx={{
            height,
            borderRadius: '40px',
            top: `-${height}`,
            zIndex: '-1',
          }}
          {...props}
          value={potentialProgress}
        />
        {/* <LinearProgress
          variant="buffer"
          sx={{
            // height: 10,
            borderRadius: 8,
            colorPrimary: 'yellow',
            colorSecondary: 'red',
          }}
          value={value}
          valueBuffer={50}
        /> */}
      </Box>
      {hideLabel ? null : (
        <Box sx={{ minWidth: size === 's' ? 2 : 35 }}>
          {/* <Box sx={{ minWidth: 50 }}> */}
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            value
          )}%`}</Typography>
        </Box>
      )}
    </Box>
  );
}

// LinearProgressWithLabel.propTypes = {
//   hidepercentage: PropTypes.any,
//   value: PropTypes.number.isRequired,
// };

// export default function LinearWithValueLabel() {
//   const [progress, setProgress] = React.useState(10);

//   React.useEffect(() => {
//     const timer = setInterval(() => {
//       setProgress((prevProgress) =>
//         prevProgress >= 100 ? 10 : prevProgress + 10
//       );
//     }, 800);
//     return () => {
//       clearInterval(timer);
//     };
//   }, []);

//   return (
//     <Box sx={{ width: '100%' }}>
//       <LinearProgressWithLabel value={progress} />
//     </Box>
//   );
// }
