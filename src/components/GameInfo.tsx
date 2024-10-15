import React from 'react';
import { GameState, Action } from '../types';

interface GameInfoProps {
   gameState: GameState;
   onAction: (action: Action) => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, onAction }) => {
   const currentPlayer = gameState.players[gameState.currentPlayerIndex];

   return (
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-80 p-4">
         <div className="flex justify-between items-center">
            <div>
               <p className="font-bold">Turn: {gameState.turn}</p>
               <p>Current Player: {currentPlayer.name}</p>
               <p>Phase: {gameState.phase}</p>
            </div>
            <div>
               <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => onAction({ type: 'endPhase', playerIndex: gameState.currentPlayerIndex })}
               >
                  End Phase
               </button>
               <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => onAction({ type: 'endTurn', playerIndex: gameState.currentPlayerIndex })}
               >
                  End Turn
               </button>
            </div>
         </div>
      </div>
   );
};

export default GameInfo;