import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/Home';
import Room from './components/Room';
import ViewerRoom from './components/ViewerRoom';
import CodeShare from './components/CodeShare';
import FileShare from './components/FileShare';
import AiChat from './components/AiChat';
import MusicRoom from './components/MusicRoom';
import { SocketProvider } from './context/SocketContext';
import { MusicProvider } from './context/MusicContext';
import { generateRoomId } from './utils/roomUtils';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <SocketProvider>
        <MusicProvider>
          <div className="min-h-screen bg-gray-900">
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to={`/room/${generateRoomId()}`} replace />} 
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/viewer/:roomId" element={<ViewerRoom />} />
                <Route path="/code/:roomId" element={<CodeShare />} />
                <Route path="/files" element={<FileShare />} />
                <Route path="/chat" element={<AiChat />} />
                <Route path="/music/:roomId" element={<MusicRoom />} />
                <Route 
                  path="/music" 
                  element={<Navigate to={`/music/${generateRoomId()}`} replace />} 
                />
              </Routes>
            </div>
          </div>
        </MusicProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
