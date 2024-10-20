import React, { useState } from 'react';
import { GameState, Action } from '../types';
import Player from './Player.tsx';
import AIPlayer from './AIPlayer';
import GameInfo from './GameInfo';

interface GameBoardProps {
   gameState: GameState;
   onAction: (action: Action) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onAction }) => {
   const [tributeSelectionMode, setTributeSelectionMode] = useState(false);
   const [tributeIndices, setTributeIndices] = useState<number[]>([]);

   const handleCardClick = (playerIndex: number, cardIndex: number, location: 'hand' | 'monster' | 'spellTrap') => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const clickedPlayer = gameState.players[playerIndex];
      const selectedCard = gameState.selectedCard;

      if (playerIndex === gameState.currentPlayerIndex) {
         if (location === 'hand') {
            const card = currentPlayer.hand[cardIndex];
            if (card.type === 'Monster' && card.summonType === 'tribute') {
               setTributeSelectionMode(true);
               setTributeIndices([]);
               onAction({ type: 'selectCard', playerIndex, cardIndex, location });
            } else {
               onAction({ type: 'selectCard', playerIndex, cardIndex, location });
            }
         } else if (location === 'monster') {
            if (tributeSelectionMode) {
               if (tributeIndices.includes(cardIndex)) {
                  setTributeIndices(tributeIndices.filter(index => index !== cardIndex));
               } else {
                  setTributeIndices([...tributeIndices, cardIndex]);
               }
            } else if (gameState.phase === 'battle' && clickedPlayer.monsterField[cardIndex]) {
               onAction({ type: 'selectCard', playerIndex, cardIndex, location });
            }
         } else if (location === 'spellTrap') {
            if (clickedPlayer.spellTrapField[cardIndex]?.type === 'Spell') {
               onAction({ type: 'activateSpell', playerIndex, cardIndex });
            }
         }
      } else if (selectedCard && location === 'monster' && gameState.phase === 'battle') {
         onAction({ type: 'attack', playerIndex: selectedCard.playerIndex, targetIndex: cardIndex });
      }
   };

   const handleTributeSummon = () => {
      if (gameState.selectedCard && gameState.selectedCard.location === 'hand') {
         const card = gameState.players[gameState.currentPlayerIndex].hand[gameState.selectedCard.cardIndex];
         if (card.tributesRequired === tributeIndices.length) {
            onAction({
               type: 'summon',
               playerIndex: gameState.currentPlayerIndex,
               cardIndex: gameState.selectedCard.cardIndex,
               tributeIndices
            });
            setTributeSelectionMode(false);
            setTributeIndices([]);
         } else {
            alert(`You need to select ${card.tributesRequired} monster(s) to tribute.`);
         }
      }
   };

   return (
      <div className="flex flex-col h-full">
         <AIPlayer player={gameState.players[1]} />
         <div className="flex-grow flex items-center justify-center bg-green-800 relative">
            <GameInfo gameState={gameState} onAction={onAction} />
            {tributeSelectionMode && (
               <div className="absolute top-0 right-0 bg-white p-2 rounded">
                  <p>Select {gameState.selectedCard?.location === 'hand' ? gameState.players[gameState.currentPlayerIndex].hand[gameState.selectedCard.cardIndex].tributesRequired : 0} monster(s) to tribute</p>
                  <button
                     className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                     onClick={handleTributeSummon}
                  >
                     Tribute Summon
                  </button>
               </div>
            )}
         </div>
         <Player
            player={gameState.players[0]}
            isCurrentPlayer={gameState.currentPlayerIndex === 0}
            onAction={(action) => onAction({ ...action, playerIndex: 0 })}
            onCardClick={(cardIndex, location) => handleCardClick(0, cardIndex, location)}
            showHand={true}
            selectedCard={gameState.selectedCard}
            gamePhase={gameState.phase}
         />
      </div>
   );
};

export default GameBoard;