import React from 'react';
import { GameState, Action } from '../types';
import Player from './Player.tsx';
import AIPlayer from './AIPlayer';
import GameInfo from './GameInfo.tsx';

interface GameBoardProps {
   gameState: GameState;
   onAction: (action: Action) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onAction }) => {
   const handleCardClick = (playerIndex: number, cardIndex: number, field: 'monster' | 'spellTrap') => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const clickedPlayer = gameState.players[playerIndex];
      const selectedCard = gameState.selectedCard;

      if (playerIndex === gameState.currentPlayerIndex) {
         if (field === 'monster') {
            if (gameState.phase === 'battle' && currentPlayer.monsterField[cardIndex]) {
               onAction({ type: 'selectCard', playerIndex, cardIndex });
            }
         } else if (field === 'spellTrap') {
            if (clickedPlayer.spellTrapField[cardIndex]?.type === 'Spell') {
               onAction({ type: 'activateSpell', playerIndex, cardIndex });
            }
         }
      } else if (selectedCard && field === 'monster' && gameState.phase === 'battle') {
         onAction({ type: 'attack', playerIndex: selectedCard.playerIndex, targetIndex: cardIndex });
      }
   };

   return (
      <div className="flex flex-col h-screen">
         <AIPlayer
            player={gameState.players[1]}
            onCardClick={(cardIndex, field) => handleCardClick(1, cardIndex, field)}
         />
         <div className="flex-grow flex items-center justify-center bg-green-800 relative">
            <GameInfo gameState={gameState} onAction={onAction} />
         </div>
         <Player
            player={gameState.players[0]}
            isCurrentPlayer={gameState.currentPlayerIndex === 0}
            onAction={(action) => onAction({ ...action, playerIndex: 0 })}
            onCardClick={(cardIndex, field) => handleCardClick(0, cardIndex, field)}
            showHand={true}
            selectedCard={gameState.selectedCard}
         />
      </div>
   );
};

export default GameBoard;