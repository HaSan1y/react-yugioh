import React from 'react';
import { Card } from '../types';

interface GraveyardViewProps {
   graveyard: Card[];
   onSelectCard: (card: Card) => void;
}

const GraveyardView: React.FC<GraveyardViewProps> = ({ graveyard, onSelectCard }) => {
   return (
      <div className="bg-gray-200 p-2 rounded">
         <h3 className="text-sm font-semibold mb-1">Graveyard</h3>
         <div className="grid grid-cols-4 gap-1">
            {graveyard.map((card) => (
               <div
                  key={card.id}
                  className="bg-white p-1 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => onSelectCard(card)}
               >
                  <img src={card.image} alt={card.name} className="w-full h-8 object-cover mb-1" />
                  <p className="text-xxs font-semibold truncate">{card.name}</p>
               </div>
            ))}
         </div>
      </div>
   );
};

export default GraveyardView;