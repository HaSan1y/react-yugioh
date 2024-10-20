import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
   card: CardType | null;
   onClick?: () => void;
   onRightClick?: () => void;
   isSelected?: boolean;
   isAttackable?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, onRightClick, isSelected, isAttackable }) => {
   if (!card) {
      return <div className="w-16 h-24 bg-gray-300 rounded shadow-md"></div>;
   }

   const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onRightClick && onRightClick();
   };

   return (
      <div
         className={`w-16 h-24 bg-gray-200 rounded shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${card.position === 'set' ? 'bg-red-200' : ''
            } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isAttackable ? 'ring-2 ring-red-500' : ''}`}
         onClick={onClick}
         onContextMenu={handleRightClick}
      >
         {card.position !== 'set' && (
            <>
               <img src={card.image} alt={card.name} className="w-full h-12 object-cover" />
               <div className="p-1">
                  <h3 className="text-xs font-bold truncate">{card.name}</h3>
                  {card.type === 'Monster' && (
                     <p className="text-xxs text-gray-600">{`ATK: ${card.attack} / DEF: ${card.defense}`}</p>
                  )}
                  <p className="text-xxs text-gray-600 truncate">{card.type}</p>
               </div>
            </>
         )}
         {isAttackable && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
               <span className="text-white font-bold text-xs">ATTACK</span>
            </div>
         )}
      </div>
   );
};

export default Card;