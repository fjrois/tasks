import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import React from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// import { getAnalytics } from 'firebase/analytics';
// import icon from '../../assets/icon.svg';
// import './App.global.css';
// import logo from './logo.svg';

import config from './config';
import PanelsCluster from './components/PanelsCluster.jsx';
// Initialize Firebase
const { firebase: firebaseConfig } = config;
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
// const analytics = getAnalytics(firebaseApp);

const user = 'user2'; // TODO: use localStorage if not user logged in

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={() => PanelsCluster({ database, user })} />
      </Switch>
    </Router>
  );
}
