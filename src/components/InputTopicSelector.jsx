import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function TopicSelector({
  selectedTopicId,
  setSelectedTopicId,
  topics,
}) {
  return (
    <FormControl size="small" sx={{ m: 0, minWidth: 85 }}>
      <InputLabel>Topic</InputLabel>
      <Select
        sx={{ m: 0 }}
        value={selectedTopicId}
        label="Topic"
        onChange={(event) => setSelectedTopicId(event.target.value)}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {topics
          ? topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.name}
              </MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  );
}
