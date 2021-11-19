import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import InputTopicSelector from './InputTopicSelector.jsx';
import useLocalStorageState from '../hooks/useLocalStorageState.js';

export default function CreateTaskForm({
  addTask,
  allowInput = true,
  selectedInputTopicId,
  setSelectedInputTopicId,
  topicsList,
}) {
  const [inputTaskTitle, setInputTaskTitle] = useLocalStorageState({
    debounce: true,
    defaultValue: '',
    key: 'tasks:input-task-title',
  });

  const [everCreatedTaskTitles, setEverCreatedTaskTitles] =
    useLocalStorageState({
      debounce: true,
      defaultValue: [],
      key: 'everCreatedTaskTitles',
    });

  return (
    <Box paddingTop="10px" paddingBottom="4px">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (inputTaskTitle) {
            const taskCreated = addTask({
              taskTitle: inputTaskTitle,
            });
            if (taskCreated) {
              if (!everCreatedTaskTitles.includes(inputTaskTitle)) {
                setEverCreatedTaskTitles((everCreatedTaskTitles) => {
                  const taskTitles = [...everCreatedTaskTitles, inputTaskTitle];
                  while (taskTitles.length > 5) taskTitles.shift();
                  return taskTitles;
                });
              }
              setInputTaskTitle('');
            }
          }
        }}
      >
        <Box display="flex" gap="10px">
          <InputTopicSelector
            selectedTopicId={selectedInputTopicId ? selectedInputTopicId : ''}
            setSelectedTopicId={setSelectedInputTopicId}
            topicsList={topicsList}
          />
          <Autocomplete
            sx={{ width: '100%' }}
            id="inputTaskTitle"
            disabled={!allowInput}
            value={inputTaskTitle || ''}
            inputValue={inputTaskTitle || ''}
            onChange={(event, newValue) => {
              setInputTaskTitle(newValue);
            }}
            onInputChange={(event, newValue) => {
              const updatedValue =
                newValue.length === 1 ? newValue.toUpperCase() : newValue;
              setInputTaskTitle(updatedValue);
            }}
            freeSolo
            disableClearable
            // options={everCreatedTaskTitles.map((option) => option)}
            options={[].map((option) => option)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Task"
                size="small"
                //     InputProps={{
                //       ...params.InputProps,
                //       type: 'search',
                //     }}
                InputProps={{
                  endAdornment: inputTaskTitle ? (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setInputTaskTitle('');
                      }}
                    >
                      <ClearIcon fontSize="10" />
                    </IconButton>
                  ) : null,
                }}
              />
            )}
          />
          <Button
            sx={{
              borderColor: 'rgb(196,196,196)',
              width: '13.8%',
              minWidth: '40px',
            }}
            size="small"
            variant="outlined"
            type="submit"
          >
            <ArrowForwardIcon color="action" fontSize="small" />
          </Button>
        </Box>
      </form>
    </Box>
  );
}
