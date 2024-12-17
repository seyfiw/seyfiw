import './App.css';
import axios from 'axios';
import { useState } from 'react';
import LoginScreen from './LoginScreen';
import FinanceScreen from './FinanceScreen';

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:1337";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleEdit = (transaction) => {
    // เก็บข้อมูลธุรกรรมที่จะแก้ไขไว้ใน state
    setEditingTransaction(transaction);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isAuthenticated && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
        {isAuthenticated && (
          <FinanceScreen 
            onEdit={handleEdit}
            editingTransaction={editingTransaction}
            setEditingTransaction={setEditingTransaction}
          />
        )}
      </header>
    </div>
  );
}

export default App;