import './App.scss';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// redux 
import { useSelector, useDispatch } from 'react-redux'


import HomePage from './pages/home/home.component';
import Dashboard from './pages/dashboard/dashboard.component'
import AppLayout from './AppLayout';


function App() {


  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app/" element={<AppLayout/>}>
          <Route index element={<Dashboard />} />
          <Route
            path="*"
            element={
              <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
              </main>
              }
          />
        </Route>
        <Route
            path="*"
            element={
              <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
              </main>
              }
          />

      </Routes>
    </BrowserRouter>

  );
}

function RequireAuth() {
  const user = useSelector((state) => state.user.user)
  const token = useSelector((state) => state.user.token)
  const dispatch = useDispatch()
}



export default App;