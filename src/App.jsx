import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
// import icon from '../../assets/icon.svg';
// import './App.global.css';
// import logo from './logo.svg';

import config from './config';
import MainView from './components/MainView.jsx';
// Initialize Firebase
const {
  firebase: firebaseConfig,
  login: { redirectUrl: loginRedirectUrl },
} = config;
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
// const analytics = getAnalytics(firebaseApp);

const actionCodeSettings = {
  handleCodeInApp: true,
  url: loginRedirectUrl,
};

const auth = getAuth();

const theme = createTheme({
  palette: {
    success: {
      main: '#91ff9a',
    },
    warning: {
      light: '#ffff8a',
      main: '#ffed7a',
    },
  },
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loginEmailSent, setLoginEmailSent] = useState(null);
  function login() {
    const defaultEmail = window.localStorage.getItem('tasks:email-for-signin');
    const email = window.prompt(
      'Please provide your email for confirmation',
      defaultEmail || ''
    );
    if (email) {
      sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
          console.log(`Login email sent to ${email}`);
          setLoginEmailSent(email);
          window.localStorage.setItem('tasks:email-for-signin', email);
        })
        .catch((error) => {
          setLoginEmailSent(null);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(`Error: ${errorCode} - ${errorMessage}`);
        });
    }
  }

  function logout() {
    console.log(`Logging out`);
    signOut(auth)
      .then(() => {
        window.localStorage.removeItem('tasks:email-for-signin');
        window.location.href = loginRedirectUrl;
        console.log(`Successfully logged out`);
      })
      .catch((error) => {
        console.log('error:', error);
      });
  }

  useEffect(() => {
    const devUserEnvVar = process.env.REACT_APP_DEV_USER;
    const devUser = devUserEnvVar ? JSON.parse(devUserEnvVar) : null;
    if (devUser) {
      setUser(devUser);
    } else {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          setUser(user);
          setLoginEmailSent(null);
        } else {
          // User is signed out
          setUser(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('tasks:email-for-signin');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {})
        .catch((error) => {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
          console.log('error:', error);
        });
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route
          path="/"
          component={() => (
            <ThemeProvider theme={theme}>
              <MainView
                database={database}
                login={login}
                loginEmailSent={loginEmailSent}
                logout={logout}
                user={user}
              />
            </ThemeProvider>
          )}
        />
      </Switch>
    </Router>
  );
}
