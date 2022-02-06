import './App.scss';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from './pages/home/home.component';
import Dashboard from './pages/dashboard/dashboard.component'
import AppLayout from './AppLayout';


function App() {
  // const userData = useSelector((state) => state.user.userData)
  // const dispatch = useDispatch()
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/app/" element={<AppLayout />}>
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
        
        <Route path="*" element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
