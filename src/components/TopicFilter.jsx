import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function TopicFilter({
  deleteTopic,
  selectedTopicId,
  setSelectedTopicIndex,
  topics,
}) {
  return (
    <ToggleButtonGroup
      size="small"
      // orientation="vertical"
      orientation="horizontal"
      value={selectedTopicId}
      exclusive
      onChange={(event, newValue) => {
        setSelectedTopicIndex(newValue);
      }}
    >
      {topics
        ? topics.map((topic, index) => (
            <ToggleButton
              onMouseDown={(event) => {
                // (Middle click) or (Right click + shift)
                if (
                  event.button === 1 ||
                  (event.button === 0 && event.shiftKey)
                ) {
                  deleteTopic(topic);
                }
              }}
              key={topic.id}
              size="small"
              sx={{
                borderColor: 'rgb(196,196,196)',
                color: 'rgb(102,102,102)',
                minWidth: '45px',
              }}
              disableRipple
              value={index}
              aria-label="list"
            >
              {<div>{topic.name}</div>}
              {/* {<div>{abbreviateName(topics[topicId].name)}</div>} */}
            </ToggleButton>
          ))
        : null}
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
