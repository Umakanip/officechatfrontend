import "./App.css";
import Chatpage from "./components/chatpage/chatpage";
import Login from "./components/LoginForm/LoginForm";
import { UserProvider } from "./components/context/UserContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VoiceCall from "./components/VoiceCall/Calls";
import VideoCall from "./components/videoCall/videoCall";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chatpage" element={<Chatpage />} />
          <Route path="/" element={<Login />} />
          <Route path="/call" element={<VoiceCall />} />
          <Route path="/video-call" element={<VideoCall />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
