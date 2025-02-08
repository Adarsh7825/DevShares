import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/Home';
import Room from './components/Room';
import ViewerRoom from './components/ViewerRoom';
import CodeShare from './components/CodeShare';
import FileShare from './components/FileShare';
import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/viewer/:roomId" element={<ViewerRoom />} />
          <Route path="/code/:roomId" element={<CodeShare />} />
          <Route path="/fileshare" element={<FileShare />} />
          {/* <Route path='/snippet' element={<SnippetLibrary />} /> */}
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
