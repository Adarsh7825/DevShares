import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import ViewerRoom from './components/ViewerRoom';
import CodeShare from './components/CodeShare';
import FileShare from './components/FileShare';
import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/view/:roomId" element={<ViewerRoom />} />
          <Route path="/code/:roomId" element={<CodeShare />} />
          <Route path="/fileshare" element={<FileShare />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
