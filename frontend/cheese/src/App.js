import './App.scss';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from './AppLayout';

import HomePage from './pages/home/home.component';
import Dashboard from './pages/dashboard/dashboard.component'
import PotsPage from './pages/pot/pots-page.component';
import TransactionsPage from './pages/transaction/transaction.page.component';


function App() {

  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/app/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pots" element={<PotsPage/>} />
            <Route path="transactions" element={<TransactionsPage/>} />
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
