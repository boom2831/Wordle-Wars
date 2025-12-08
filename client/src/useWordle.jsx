import { useState } from 'react';

const useWordle = (solution) => {
  const [turn, setTurn] = useState(0); 
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([...Array(6)]); // History of guesses
  const [history, setHistory] = useState([]); // History of strings
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedKeys, setUsedKeys] = useState({}); // {a: 'green', b: 'yellow'}

  // Format a guess into an array of letter objects {key: 'a', color: 'yellow'}
  const formatGuess = () => {
    let solutionArray = [...solution];
    let formattedGuess = [...currentGuess].map((l) => ({key: l, color: 'grey'}));

    // Find Greens first
    formattedGuess.forEach((l, i) => {
      if (solutionArray[i] === l.key) {
        formattedGuess[i].color = 'green';
        solutionArray[i] = null;
      }
    });

    // Find Yellows
    formattedGuess.forEach((l, i) => {
      if (l.color !== 'green' && solutionArray.includes(l.key)) {
        formattedGuess[i].color = 'yellow';
        solutionArray[solutionArray.indexOf(l.key)] = null;
      }
    });

    return formattedGuess;
  }

  const addNewGuess = (formatted) => {
    if (currentGuess === solution) setIsCorrect(true);
    
    setGuesses((prev) => {
      let newGuesses = [...prev];
      newGuesses[turn] = formatted;
      return newGuesses;
    });
    setHistory((prev) => [...prev, currentGuess]);
    setTurn((prev) => prev + 1);
    
    // Update keyboard colors
    setUsedKeys((prev) => {
      let newKeys = {...prev};
      formatted.forEach((l) => {
        const currentColor = newKeys[l.key];
        if (l.color === 'green') {
          newKeys[l.key] = 'green';
          return;
        }
        if (l.color === 'yellow' && currentColor !== 'green') {
          newKeys[l.key] = 'yellow';
          return;
        }
        if (l.color === 'grey' && currentColor !== 'green' && currentColor !== 'yellow') {
          newKeys[l.key] = 'grey';
          return;
        }
      });
      return newKeys;
    });
    setCurrentGuess('');
  }

  const handleKeyup = ({ key }) => {
    if (key === 'Enter') {
      if (turn > 5 || history.includes(currentGuess) || currentGuess.length !== 5) return;
      const formatted = formatGuess();
      addNewGuess(formatted);
    }
    if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Za-z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess((prev) => (prev + key).toUpperCase());
    }
  }

  return { turn, currentGuess, guesses, isCorrect, usedKeys, handleKeyup, formatGuess };
}

export default useWordle;