import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import useWordle from "./useWordle";
import Grid, { MiniGrid } from "./components/grid";
import './index.css'; 

// Replace with your DEPLOYED backend URL later
const socket = io.connect("https://wordle-wars-vt0k.onrender.com");

function WordleGame({ solution, multiplayer, onUpdate }) {
  const { currentGuess, handleKeyup, guesses, isCorrect, turn, formatGuess } = useWordle(solution);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);
    
    // If multiplayer, emit progress on every completed turn
    if (multiplayer && turn > 0) {
       // Get the last completed guess colors
       const lastGuess = guesses[turn - 1];
       const colors = lastGuess.map(l => l.color); 
       onUpdate(colors, turn);
    }

    if (isCorrect) console.log("WINNER"); // Handle win logic here
    if (turn > 5) console.log("LOST");   // Handle loss logic here

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup, isCorrect, turn]);

  return (
    <div>
      <Grid currentGuess={currentGuess} guesses={guesses} turn={turn} />
      {isCorrect && <div className="text-green-600 font-bold text-center mt-4">You Won!</div>}
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("menu"); // menu, solo, multi
  const [room, setRoom] = useState("");
  const [solution, setSolution] = useState("");
  const [opponentProgress, setOpponentProgress] = useState([...Array(6)]);
  const [gameStatus, setGameStatus] = useState("waiting"); // waiting, playing, ended

  // 1. Challenge Link Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedWord = params.get("w");
    if (encodedWord) {
      setSolution(atob(encodedWord));
      setMode("solo");
    }
  }, []);

  const createChallengeLink = (word) => {
    const link = `${window.location.origin}?w=${btoa(word.toUpperCase())}`;
    navigator.clipboard.writeText(link);
    alert("Link copied: " + link);
  };

  // 2. Multiplayer Socket Logic
  useEffect(() => {
    socket.on("start_game", (data) => {
      setSolution(data.word);
      setGameStatus("playing");
    });
    
    socket.on("opponent_update", (data) => {
      setOpponentProgress(prev => {
        const newP = [...prev];
        newP[data.currentRow - 1] = data.rowColors;
        return newP;
      });
    });
  }, []);

  const joinRoom = () => {
    socket.emit("join_room", room);
    setMode("multi");
  };

  const handleMultiplayerUpdate = (colors, row) => {
    socket.emit("update_progress", { room, rowColors: colors, currentRow: row });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-4xl font-extrabold mb-10 tracking-widest">WORDLE WARS</h1>

      {/* MENU MODE */}
      {mode === "menu" && (
        <div className="flex flex-col gap-4 p-6 bg-white shadow-xl rounded-xl">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold mb-2">Create Challenge Link</h2>
            <input id="wordInput" maxLength={5} className="border p-2 rounded w-full uppercase" placeholder="Enter 5-letter word" />
            <button onClick={() => createChallengeLink(document.getElementById('wordInput').value)} className="bg-blue-500 text-white w-full py-2 mt-2 rounded">Copy Link</button>
          </div>
          
          <div className="pt-2">
            <h2 className="text-xl font-bold mb-2">Join Live Multiplayer</h2>
            <input onChange={(e) => setRoom(e.target.value)} className="border p-2 rounded w-full" placeholder="Enter Room ID (e.g., 123)" />
            <button onClick={joinRoom} className="bg-purple-600 text-white w-full py-2 mt-2 rounded">Join Room</button>
          </div>
        </div>
      )}

      {/* SOLO MODE (Playing from Link) */}
      {mode === "solo" && (
        <div>
           <h2 className="text-center mb-4 text-gray-500">Challenge Mode</h2>
           <WordleGame solution={solution} multiplayer={false} />
        </div>
      )}

      {/* MULTIPLAYER MODE */}
      {mode === "multi" && (
        <div className="w-full max-w-4xl flex justify-between px-10">
           
           {/* MY BOARD */}
           <div>
             <h2 className="text-center font-bold mb-4">YOU</h2>
             {gameStatus === "waiting" ? <p>Waiting for opponent...</p> : 
              <WordleGame solution={solution} multiplayer={true} onUpdate={handleMultiplayerUpdate} />
             }
           </div>

           {/* VS SEPARATOR */}
           <div className="flex flex-col items-center justify-center">
             <div className="h-full w-px bg-gray-300"></div>
             <span className="font-bold text-red-500 my-4 text-xl">VS</span>
             <div className="h-full w-px bg-gray-300"></div>
           </div>

           {/* OPPONENT BOARD (Mini) */}
           <div>
             <h2 className="text-center font-bold mb-4 text-red-500">OPPONENT</h2>
             <MiniGrid guesses={opponentProgress} />
           </div>

        </div>
      )}
    </div>
  );
}

export default App;