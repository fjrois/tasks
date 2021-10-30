import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function TopicFilter({
  selectedTopicId,
  setSelectedTopicId,
  topics,
}) {
  return (
    <ToggleButtonGroup
      size="small"
      // orientation="vertical"
      orientation="horizontal"
      value={selectedTopicId}
      exclusive
      onChange={(event, nextView) => {
        setSelectedTopicId(nextView);
      }}
    >
      {Object.keys(topics).map((topicId) => (
        <ToggleButton
          key={topicId}
          size="small"
          sx={{
            borderColor: 'rgb(196,196,196)',
            color: 'rgb(102,102,102)',
            minWidth: '45px',
          }}
          disableRipple
          value={topicId}
          aria-label="list"
        >
          {<div>{topics[topicId].name}</div>}
          {/* {<div>{abbreviateName(topics[topicId].name)}</div>} */}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

// TODO: move abbreviation to topic creation, and handle duplicates (T,Ta...)
// function abbreviateName(name) {
//   if (!name) return name;
//   const words = name.split(' ').map((word) => word.trim());
//   const abbreviation = words.reduce(
//     (acc, item) => acc + item[0].toUpperCase(),
//     ''
//   );

//   return abbreviation;
// }
