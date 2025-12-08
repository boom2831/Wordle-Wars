import React from 'react';

// Row Component
function Row({ guess, currentGuess }) {
  if (guess) {
    return (
      <div className="flex gap-1 justify-center mb-1">
        {guess.map((l, i) => (
          <div key={i} className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold uppercase ${l.color}`}>
            {l.key}
          </div>
        ))}
      </div>
    )
  }
  if (currentGuess) {
    let letters = currentGuess.split('');
    return (
      <div className="flex gap-1 justify-center mb-1">
        {letters.map((letter, i) => (
          <div key={i} className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center text-2xl font-bold animate-bounce-short">{letter}</div>
        ))}
        {[...Array(5 - letters.length)].map((_, i) => (
          <div key={i} className="w-12 h-12 border-2 border-gray-200"></div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-1 justify-center mb-1">
      {[...Array(5)].map((_, i) => <div key={i} className="w-12 h-12 border-2 border-gray-200"></div>)}
    </div>
  )
}

// Mini Grid for Opponent (No letters, just colors)
export function MiniGrid({ guesses }) {
  return (
    <div className="scale-75">
       {guesses.map((g, i) => (
         <div key={i} className="flex gap-1 justify-center mb-1">
            {[...Array(5)].map((_, j) => (
              <div key={j} className={`w-6 h-6 border ${g ? g[j] : 'bg-gray-100'}`}></div>
            ))}
         </div>
       ))}
    </div>
  )
}

export default function Grid({ currentGuess, guesses, turn }) {
  return (
    <div>
      {guesses.map((g, i) => {
        if (turn === i) return <Row key={i} currentGuess={currentGuess} />
        return <Row key={i} guess={g} />
      })}
    </div>
  )
}