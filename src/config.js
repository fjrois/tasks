const config = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: 'tasks-f3816.firebaseapp.com',
    projectId: 'tasks-f3816',
    storageBucket: 'tasks-f3816.appspot.com', // Not required for Firestore
    messagingSenderId: '979516677467', // Not required for Firestore
    appId: '1:979516677467:web:fd282e8de7d88f98d18e7e', // Not required for Firestore
    measurementId: 'G-NE37LF7LZ6', // Not required for Firestore
  },
  login: {
    redirectUrl: process.env.REACT_APP_LOGIN_REDIRECT_URL,
  },
};

export default config;
