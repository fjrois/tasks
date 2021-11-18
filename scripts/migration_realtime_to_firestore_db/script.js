// Convert Firebase Real-Time Database user data to Firebase Firestore compatible JSON
const fs = require('fs');
const userId = ''; // <- Add user id here

fs.readFile('./data.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const dateNow = Date.now();

  const parsedData = JSON.parse(data);

  const panels = parsedData['panels'][userId];
  const topics = parsedData['topics'][userId];
  const lists = parsedData['lists'][userId];

  // PANELS
  const normalizedPanels = {};

  let normalPanel = {
    // id: `panel-${uuidv4()}`,
    // name: panelName,
    dateModified: dateNow,
    dateDeleted: 0,
  };
  let dateCreated = 1;
  for (const panel of panels) {
    let normalizedPanel = {
      ...normalPanel,
      ...panel,
      ...{ dateCreated, progress: { real: 0, potential: 0 } },
    };
    normalizedPanels[panel.id] = normalizedPanel;
    dateCreated++;
  }

  fs.writeFile(
    './output/normalizedPanels.json',
    JSON.stringify(normalizedPanels, null, 4),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );

  // TOPICS
  const normalizedTopics = {};
  const normalTopic = {
    // id: `topic-${uuidv4()}`,
    // name: topicName,
    dateCreated: dateNow,
    dateModified: dateNow,
    dateDeleted: 0,
  };
  for (const topic of topics) {
    let normalizedTopic = {
      ...normalTopic,
      ...topic,
    };
    normalizedTopics[topic.id] = normalizedTopic;
  }

  fs.writeFile(
    './output/normalizedTopics.json',
    JSON.stringify(normalizedTopics, null, 4),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );

  // TASKS
  const normalizedTasks = {};
  const normalTask = {
    // id: uuidv4(),
    // title: taskTitle,
    status: 'todo',
    topic: null,
    panelId: null,
    dateCreated: dateNow,
    dateModified: dateNow,
    dateDeleted: 0,
  };
  for (const panelId in lists) {
    console.log('panelId:', panelId);
    const panelTasks = lists[panelId];
    console.log('panelTasks:', panelTasks);
    for (const task of panelTasks) {
      let normalizedTask = {
        ...normalTask,
        ...task,
        ...{ panelId },
      };
      console.log('normalizedTask:', normalizedTask);
      normalizedTasks[task.id] = normalizedTask;
    }
  }

  fs.writeFile(
    './output/normalizedTasks.json',
    JSON.stringify(normalizedTasks, null, 4),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
});
