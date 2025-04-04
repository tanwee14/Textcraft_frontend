import {React , StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import the Router
import App from './App';
import { FirebaseProvider } from './context/firebase.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseProvider>
      <App/>
    </FirebaseProvider>
  </StrictMode>
);
