
// Import React
import React from  'react';

// Import ReactDOM
import ReactDOM from  'react-dom';

// Import F7 Bundle
import Framework7 from 'framework7/framework7.esm.bundle';

// Import F7-React Plugin
import Framework7React from 'framework7-react';

// Icons
import './css/icons.css';

// Custom app styles
// import './css/app.css';

// Import Main App component
import App from './App.jsx';

// Framework7 styles
import 'framework7/css/framework7.min.css';

// Icons
// import './css/icons.css';

// Custom app styles
// import './css/app.css';

// Init F7-React Plugin
Framework7.use(Framework7React);

// Mount React App
ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
