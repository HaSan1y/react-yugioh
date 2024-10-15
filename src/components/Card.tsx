import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
   card: CardType | null;
   onClick?: () => void;
   onRightClick?: () => void;
   isSelected?: boolean;
   isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, onRightClick, isSelected, isHighlighted }) => {
   if (!card) {
      return <div className="w-32 h-48 bg-gray-300 rounded-lg shadow-md"></div>;
   }

   const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onRightClick && onRightClick();
   };

   return (
      <div
         className={`w-32 h-48 bg-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${card.position === 'set' ? 'bg-red-200' : ''
            } ${isSelected ? 'ring-4 ring-blue-500' : ''}${isHighlighted ? 'ring-4 ring-yellow-500' : ''}`}
         onClick={onClick}
         onContextMenu={handleRightClick}
      >
         {card.position !== 'set' && (
            <>
               <img src={card.image} alt={card.name} className="w-full h-24 object-cover" />
               <div className="p-2">
                  <h3 className="text-sm font-bold truncate">{card.name}</h3>
                  {card.type === 'Monster' && (
                     <p className="text-xs text-gray-600">{`ATK: ${card.attack} / DEF: ${card.defense}`}</p>
                  )}
                  <p className="text-xs text-gray-600 truncate">{card.type}</p>
               </div>
            </>
         )}
      </div>
   );
};

export default Card;