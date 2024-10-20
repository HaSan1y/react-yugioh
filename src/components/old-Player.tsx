import React, { useState } from 'react';
import { Player as PlayerType, Action } from '../types';
import CardComponent from './Card';

interface PlayerProps {
   player: PlayerType;
   isCurrentPlayer: boolean;
   onAction: (action: Omit<Action, 'playerIndex'>) => void;
   onCardClick: (cardIndex: number, field: 'monster' | 'spellTrap') => void;
   showHand: boolean;
   selectedCard: { playerIndex: number; cardIndex: number } | null;
}

const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer, onAction, onCardClick, showHand, selectedCard }) => {
   const [tributeMode, setTributeMode] = useState(false);
   const [tributeIndices, setTributeIndices] = useState<number[]>([]);
   const [summoningCardIndex, setSummoningCardIndex] = useState<number | null>(null);

   const handleSummon = (cardIndex: number) => {
      const card = player.hand[cardIndex];
      if (card.type === 'Monster') {
         if (card.tributesRequired && card.tributesRequired > 0) {
            setTributeMode(true);
            setTributeIndices([]);
            setSummoningCardIndex(cardIndex);
         } else {
            onAction({ type: 'summon', cardIndex });
         }
      }
   };

   const handleTributeSelection = (index: number) => {
      if (tributeMode) {
         const newTributeIndices = [...tributeIndices];
         const existingIndex = newTributeIndices.indexOf(index);
         if (existingIndex !== -1) {
            newTributeIndices.splice(existingIndex, 1);
         } else {
            newTributeIndices.push(index);
         }
         setTributeIndices(newTributeIndices);
      }
   };
   const handleTributeSummon = () => {
      if (summoningCardIndex !== null) {
         const card = player.hand[summoningCardIndex];
         if (card.tributesRequired && tributeIndices.length === card.tributesRequired) {
            onAction({ type: 'tribute', cardIndex: summoningCardIndex, tributeIndices });
            setTributeMode(false);
            setTributeIndices([]);
            setSummoningCardIndex(null);
         }
      }
   };
   return (
      <div className={`p-4 ${isCurrentPlayer ? 'bg-blue-100' : 'bg-gray-100'}`}>
         <h2 className="text-xl font-bold mb-2">{player.name}</h2>
         <p className="mb-2">Life Points: {player.lifePoints}</p>
         {showHand && (
            <div className="mb-4">
               <h3 className="text-lg font-semibold mb-2">Hand</h3>
               <div className="flex space-x-2 overflow-x-auto">
                  {player.hand.map((card, index) => (
                     <CardComponent
                        key={card.id}
                        card={card}
                        onClick={() => handleSummon(index)}
                        onRightClick={() => onAction({ type: 'set', cardIndex: index })}
                     />
                  ))}
               </div>
            </div>
         )}
         <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Monster Field</h3>
            <div className="flex space-x-2 overflow-x-auto">
               {player.monsterField.map((card, index) => (
                  <CardComponent
                     key={index}
                     card={card}
                     onClick={() => tributeMode ? handleTributeSelection(index) : onCardClick(index, 'monster')}
                     onRightClick={() => card && card.position === 'set' && onAction({ type: 'flip', cardIndex: index })}
                     isSelected={selectedCard?.playerIndex === player.name && selectedCard?.cardIndex === index}
                     isHighlighted={tributeIndices.includes(index)}
                  />
               ))}
            </div>
         </div>
         <div>
            <h3 className="text-lg font-semibold mb-2">Spell/Trap Field</h3>
            <div className="flex space-x-2 overflow-x-auto">
               {player.spellTrapField.map((card, index) => (
                  <CardComponent
                     key={index}
                     card={card}
                     onClick={() => onCardClick(index, 'spellTrap')}
                  />
               ))}
            </div>
         </div>
         {tributeMode && (
            <button
               className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
               onClick={handleTributeSummon}
            >
               Tribute Summon
            </button>
         )}
      </div>
   );
};

export default Player;