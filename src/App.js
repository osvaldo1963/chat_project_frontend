import logo from './logo.svg';
import './App.css';
import Peer from 'simple-peer';
import React, { useEffect, useRef, useState } from "react"
function App() {
  const [ stream, setStream ] = useState();
  const myVideo = useRef()
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true, 
      audio: true
    }).then((stream) => {
      const peer1 = new Peer({initiator: true});
      peer1.on('signal', (data) => {
        setStream(data)
        myVideo.current.srcObject = stream
      });
     
    }).catch((error) => {
      console.log(error);
    })
  });
  

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
          {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "700px" }} />}
        </a>
      </header>
    </div>
  );
}

export default App;
