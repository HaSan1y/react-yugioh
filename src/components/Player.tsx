import React from 'react';
import { Player as PlayerType, Action, Card, Phase } from '../types';
import CardComponent from './Card';
import GraveyardView from './GraveyardView';

interface PlayerProps {
   player: PlayerType;
   isCurrentPlayer: boolean;
   onAction: (action: Omit<Action, 'playerIndex'>) => void;
   onCardClick: (cardIndex: number, location: 'hand' | 'monster' | 'spellTrap') => void;
   showHand: boolean;
   selectedCard: { playerIndex: number; cardIndex: number; location: 'hand' | 'monster' | 'spellTrap' } | null;
   gamePhase: Phase;
}

const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer, onAction, onCardClick, showHand, selectedCard, gamePhase }) => {
   const handleSummon = (cardIndex: number) => {
      const card = player.hand[cardIndex];
      if (card.type === 'Monster') {
         if (card.summonType === 'tribute') {
            const tributesRequired = card.tributesRequired || 0;
            const availableTributes = player.monsterField.filter(monster => monster !== null).length;

            if (availableTributes >= tributesRequired) {
               onAction({ type: 'selectCard', cardIndex, location: 'hand' });
               alert(`Select ${tributesRequired} monster(s) to tribute for ${card.name}`);
            } else {
               alert(`Not enough monsters to tribute. You need ${tributesRequired} tribute(s) for ${card.name}`);
            }
         } else if (card.summonType === 'normal' && player.normalSummonAvailable) {
            onAction({ type: 'summon', cardIndex });
         } else if (card.summonType === 'fusion') {
            onAction({ type: 'summon', cardIndex });
         } else {
            console.log('Cannot summon this monster');
         }
      } else {
         onAction({ type: 'set', cardIndex });
      }
   };

   const handleGraveyardCardSelect = (card: Card) => {
      // Implement logic for selecting cards from the graveyard
      console.log('Selected card from graveyard:', card);
   };

   return (
      <div className={`p-2 ${isCurrentPlayer ? 'bg-blue-100' : 'bg-gray-100'}`}>
         <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">{player.name}</h2>
            <p>Life Points: {player.lifePoints}</p>
         </div>
         {showHand && (
            <div className="mb-2">
               <h3 className="text-sm font-semibold mb-1">Hand</h3>
               <div className="flex space-x-1 overflow-x-auto">
                  {player.hand.map((card, index) => (
                     <CardComponent
                        key={card.id}
                        card={card}
                        onClick={() => onCardClick(index, 'hand')}
                        onRightClick={() => handleSummon(index)}
                        isSelected={selectedCard?.playerIndex === player.name && selectedCard?.cardIndex === index && selectedCard?.location === 'hand'}
                     />
                  ))}
               </div>
            </div>
         )}
         <div className="mb-2">
            <h3 className="text-sm font-semibold mb-1">Monster Field</h3>
            <div className="flex space-x-1 overflow-x-auto">
               {player.monsterField.map((card, index) => (
                  <CardComponent
                     key={index}
                     card={card}
                     onClick={() => onCardClick(index, 'monster')}
                     onRightClick={() => card && card.position === 'set' && onAction({ type: 'flip', cardIndex: index })}
                     isSelected={selectedCard?.playerIndex === player.name && selectedCard?.cardIndex === index && selectedCard?.location === 'monster'}
                     isAttackable={gamePhase === 'battle' && isCurrentPlayer}
                  />
               ))}
            </div>
         </div>
         <div className="mb-2">
            <h3 className="text-sm font-semibold mb-1">Spell/Trap Field</h3>
            <div className="flex space-x-1 overflow-x-auto">
               {player.spellTrapField.map((card, index) => (
                  <CardComponent
                     key={index}
                     card={card}
                     onClick={() => onCardClick(index, 'spellTrap')}
                     isSelected={selectedCard?.playerIndex === player.name && selectedCard?.cardIndex === index && selectedCard?.location === 'spellTrap'}
                  />
               ))}
            </div>
         </div>
         <GraveyardView graveyard={player.graveyard} onSelectCard={handleGraveyardCardSelect} />
      </div>
   );
};

export default Player;