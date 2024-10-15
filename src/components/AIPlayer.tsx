import React from 'react';
import { Player as PlayerType } from '../types';
import Card from './Card.tsx';

interface AIPlayerProps {
   player: PlayerType;
}

const AIPlayer: React.FC<AIPlayerProps> = ({ player }) => {
   return (
      <div className="p-4 bg-gray-100">
         <h2 className="text-xl font-bold mb-2">{player.name} (AI)</h2>
         <p className="mb-2">Life Points: {player.lifePoints}</p>
         <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Hand</h3>
            <div className="flex space-x-2 overflow-x-auto">
               {player.hand.map((_, index) => (
                  <div key={index} className="w-32 h-48 bg-red-300 rounded-lg shadow-md"></div>
               ))}
            </div>
         </div>
         <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Monster Field</h3>
            <div className="flex space-x-2 overflow-x-auto">
               {player.monsterField.map((card, index) => (
                  <Card key={index} card={card} />
               ))}
            </div>
         </div>
         <div>
            <h3 className="text-lg font-semibold mb-2">Spell/Trap Field</h3>
            <div className="flex space-x-2 overflow-x-auto">
               {player.spellTrapField.map((card, index) => (
                  <Card key={index} card={card} />
               ))}
            </div>
         </div>
      </div>
   );
};

export default AIPlayer;