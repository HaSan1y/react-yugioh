import React, { useState, useEffect } from 'react';
import { GameState, Card, Player, Action, Phase } from './types';
import GameBoard from './components/GameBoard';
import { initialCards } from './data/cards';
import MessageLog from './components/MessageLog';

const createInitialPlayer = (name: string): Player => ({
   name,
   hand: [],
   monsterField: Array(5).fill(null),
   spellTrapField: Array(5).fill(null),
   graveyard: [],
   lifePoints: 8000,
   normalSummonAvailable: true,
});

const phases: Phase[] = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];

const App: React.FC = () => {
   const [gameState, setGameState] = useState<GameState>({
      players: [createInitialPlayer('Player'), createInitialPlayer('AI')],
      currentPlayerIndex: 0,
      phase: 'draw',
      turn: 1,
      selectedCard: null,
      messages: [],
      firstTurn: true,
      actionLog: [], // Add this line
   });

   useEffect(() => {
      // Initialize the game
      setGameState((prevState) => {
         const newState = { ...prevState };
         newState.players.forEach((player) => {
            for (let i = 0; i < 5; i++) {
               const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
               player.hand.push({ ...randomCard, id: `${randomCard.id}-${Math.random()}` });
            }
         });

         // Coin flip to decide who goes first
         const coinFlip = Math.random() < 0.5;
         newState.currentPlayerIndex = coinFlip ? 0 : 1;
         newState.messages.push(`Coin flip result: ${coinFlip ? 'Player' : 'AI'} goes first!`);

         return newState;
      });
   }, []);

   useEffect(() => {
      if (gameState.currentPlayerIndex === 1) {
         performAIActions();
      }
   }, [gameState.currentPlayerIndex, gameState.phase]);

   const addMessage = (message: string) => {
      setGameState((prevState) => ({
         ...prevState,
         messages: [...prevState.messages, message],
      }));
   };

   const handleAction = (action: Action) => {
      setGameState((prevState) => {
         const newState = { ...prevState };
         const currentPlayer = newState.players[action.playerIndex];
         const opponentIndex = action.playerIndex === 0 ? 1 : 0;
         const opponent = newState.players[opponentIndex];

         switch (action.type) {
            case 'summon':
            case 'set':
               if (newState.phase !== 'main1' && newState.phase !== 'main2') {
                  addMessage(`Cannot ${action.type} during ${newState.phase} phase.`);
                  return newState;
               }
               if (action.cardIndex !== undefined && action.cardIndex >= 0 && action.cardIndex < currentPlayer.hand.length) {
                  const card = currentPlayer.hand[action.cardIndex];
                  if (card.type === 'Monster') {
                     if (card.summonType === 'tribute' && action.tributeIndices && action.tributeIndices.length === card.tributesRequired) {
                        // Perform tribute summon
                        action.tributeIndices.forEach(index => {
                           const tributedCard = currentPlayer.monsterField[index];
                           if (tributedCard) {
                              currentPlayer.graveyard.push(tributedCard);
                              currentPlayer.monsterField[index] = null;
                           }
                        });
                        const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                        if (emptySlot !== -1) {
                           currentPlayer.monsterField[emptySlot] = { ...card, position: action.type === 'set' ? 'set' : 'attack' };
                           currentPlayer.hand.splice(action.cardIndex, 1);
                           currentPlayer.normalSummonAvailable = false;
                           addMessage(`${currentPlayer.name} tribute summoned ${card.name}`);
                        }
                     } else if (card.summonType === 'normal' && currentPlayer.normalSummonAvailable) {
                        // Perform normal summon
                        const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                        if (emptySlot !== -1) {
                           currentPlayer.monsterField[emptySlot] = { ...card, position: action.type === 'set' ? 'set' : 'attack' };
                           currentPlayer.hand.splice(action.cardIndex, 1);
                           currentPlayer.normalSummonAvailable = false;
                           addMessage(`${currentPlayer.name} summoned ${card.name}`);
                        }
                     } else if (card.summonType === 'fusion') {
                        // Implement fusion summon logic here
                        // For simplicity, we'll just check if the required fusion materials are in the hand
                        if (card.fusionMaterials && card.fusionMaterials.every(material =>
                           currentPlayer.hand.some(handCard => handCard.name === material))) {
                           const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                           if (emptySlot !== -1) {
                              currentPlayer.monsterField[emptySlot] = { ...card, position: 'attack' };
                              card.fusionMaterials.forEach(material => {
                                 const index = currentPlayer.hand.findIndex(handCard => handCard.name === material);
                                 if (index !== -1) {
                                    currentPlayer.graveyard.push(currentPlayer.hand[index]);
                                    currentPlayer.hand.splice(index, 1);
                                 }
                              });
                              currentPlayer.hand.splice(action.cardIndex, 1);
                              addMessage(`${currentPlayer.name} fusion summoned ${card.name}`);
                           }
                        }
                     }
                  } else {
                     // Set Spell/Trap card
                     const emptySlot = currentPlayer.spellTrapField.findIndex(slot => slot === null);
                     if (emptySlot !== -1) {
                        currentPlayer.spellTrapField[emptySlot] = { ...card, position: 'set' };
                        currentPlayer.hand.splice(action.cardIndex, 1);
                        addMessage(`${currentPlayer.name} set a card`);
                     }
                  }
               }
               break;
            case 'attack':
               if (newState.phase !== 'battle') {
                  addMessage(`Cannot attack during ${newState.phase} phase.`);
                  return newState;
               }
               if (newState.firstTurn) {
                  addMessage(`Cannot attack on the first turn.`);
                  return newState;
               }
               if (newState.selectedCard && action.targetIndex !== undefined) {
                  const attackingCard = currentPlayer.monsterField[newState.selectedCard.cardIndex];
                  const targetCard = opponent.monsterField[action.targetIndex];
                  if (attackingCard && targetCard) {
                     if (targetCard.position === 'attack') {
                        if (attackingCard.attack! > targetCard.attack!) {
                           const damage = attackingCard.attack! - targetCard.attack!;
                           opponent.lifePoints -= damage;
                           opponent.monsterField[action.targetIndex] = null;
                           opponent.graveyard.push(targetCard);
                           addMessage(`${attackingCard.name} destroyed ${targetCard.name}. ${opponent.name} took ${damage} damage.`);
                        } else if (attackingCard.attack! < targetCard.attack!) {
                           const damage = targetCard.attack! - attackingCard.attack!;
                           currentPlayer.lifePoints -= damage;
                           currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                           currentPlayer.graveyard.push(attackingCard);
                           addMessage(`${targetCard.name} destroyed ${attackingCard.name}. ${currentPlayer.name} took ${damage} damage.`);
                        } else {
                           currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                           opponent.monsterField[action.targetIndex] = null;
                           currentPlayer.graveyard.push(attackingCard);
                           opponent.graveyard.push(targetCard);
                           addMessage(`${attackingCard.name} and ${targetCard.name} destroyed each other.`);
                        }
                     } else {
                        if (attackingCard.attack! > targetCard.defense!) {
                           opponent.monsterField[action.targetIndex] = null;
                           opponent.graveyard.push(targetCard);
                           addMessage(`${attackingCard.name} destroyed ${targetCard.name} in defense position.`);
                        } else if (attackingCard.attack! < targetCard.defense!) {
                           const damage = targetCard.defense! - attackingCard.attack!;
                           currentPlayer.lifePoints -= damage;
                           addMessage(`${currentPlayer.name} took ${damage} damage. ${targetCard.name} was not destroyed.`);
                        } else {
                           addMessage(`${attackingCard.name} attacked ${targetCard.name}, but neither was destroyed.`);
                        }
                     }
                  } else if (attackingCard && !targetCard) {
                     // Direct attack
                     opponent.lifePoints -= attackingCard.attack!;
                     addMessage(`${attackingCard.name} attacked directly. ${opponent.name} took ${attackingCard.attack!} damage.`);
                  }
                  newState.selectedCard = null;
               }
               break;
            case 'endPhase':
               const currentPhaseIndex = phases.indexOf(newState.phase);
               newState.phase = phases[(currentPhaseIndex + 1) % phases.length];
               addMessage(`Phase changed to ${newState.phase}`);
               if (newState.phase === 'draw') {
                  // Switch turns when reaching the draw phase
                  newState.currentPlayerIndex = newState.currentPlayerIndex === 0 ? 1 : 0;
                  newState.turn++;
                  newState.selectedCard = null;
                  newState.players[newState.currentPlayerIndex].normalSummonAvailable = true;
                  newState.firstTurn = false;
                  // Draw a card for the new player
                  const newCurrentPlayer = newState.players[newState.currentPlayerIndex];
                  if (newCurrentPlayer.hand.length < 6) {
                     const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
                     newCurrentPlayer.hand.push({ ...randomCard, id: `${randomCard.id}-${Math.random()}` });
                  }
                  addMessage(`Turn ${newState.turn}: ${newCurrentPlayer.name}'s turn`);
               }
               break;
            case 'endTurn':
               newState.currentPlayerIndex = newState.currentPlayerIndex === 0 ? 1 : 0;
               newState.phase = 'draw';
               newState.turn++;
               newState.selectedCard = null;
               newState.players[newState.currentPlayerIndex].normalSummonAvailable = true;
               newState.firstTurn = false;
               // Draw a card for the new player
               const newCurrentPlayer = newState.players[newState.currentPlayerIndex];
               if (newCurrentPlayer.hand.length < 6) {
                  const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
                  newCurrentPlayer.hand.push({ ...randomCard, id: `${randomCard.id}-${Math.random()}` });
               }
               addMessage(`Turn ${newState.turn}: ${newCurrentPlayer.name}'s turn`);
               break;
         }

         return newState;
      });
   };

   const performAIActions = () => {
      setGameState((prevState) => {
         const newState = { ...prevState };
         const ai = newState.players[1];

         switch (newState.phase) {
            case 'draw':
               // AI draws a card (already handled in endTurn action)
               handleAction({ type: 'endPhase', playerIndex: 1 });
               break;
            case 'standby':
               // No action in standby phase
               handleAction({ type: 'endPhase', playerIndex: 1 });
               break;
            case 'main1':
               // Summon strongest monster if possible
               const strongestMonster = ai.hand
                  .filter(card => card.type === 'Monster')
                  .sort((a, b) => (b.attack || 0) - (a.attack || 0))[0];

               if (strongestMonster) {
                  const cardIndex = ai.hand.findIndex(card => card.id === strongestMonster.id);
                  if (strongestMonster.summonType === 'tribute') {
                     const tributesRequired = strongestMonster.tributesRequired || 0;
                     const availableTributes = ai.monsterField.filter(monster => monster !== null);
                     if (availableTributes.length >= tributesRequired) {
                        const tributeIndices = availableTributes
                           .slice(0, tributesRequired)
                           .map(monster => ai.monsterField.indexOf(monster));
                        handleAction({ type: 'summon', playerIndex: 1, cardIndex, tributeIndices });
                     }
                  } else if (strongestMonster.summonType === 'normal' && ai.normalSummonAvailable) {
                     handleAction({ type: 'summon', playerIndex: 1, cardIndex });
                  }
               }

               // Set spell/trap cards
               ai.hand.forEach((card, index) => {
                  if (card.type === 'Spell' || card.type === 'Trap') {
                     handleAction({ type: 'set', playerIndex: 1, cardIndex: index });
                  }
               });

               handleAction({ type: 'endPhase', playerIndex: 1 });
               break;
            case 'battle':
               // Attack with all monsters
               if (!newState.firstTurn) {
                  ai.monsterField.forEach((monster, index) => {
                     if (monster && monster.position === 'attack') {
                        const targetIndex = newState.players[0].monsterField.findIndex(card => card !== null);
                        if (targetIndex !== -1) {
                           handleAction({ type: 'attack', playerIndex: 1, cardIndex: index, targetIndex });
                        } else {
                           // Direct attack
                           handleAction({ type: 'attack', playerIndex: 1, cardIndex: index });
                        }
                     }
                  });
               }
               handleAction({ type: 'endPhase', playerIndex: 1 });
               break;
            case 'main2':
               // No action in main phase 2 for simplicity
               handleAction({ type: 'endPhase', playerIndex: 1 });
               break;
            case 'end':
               // End turn
               handleAction({ type: 'endTurn', playerIndex: 1 });
               break;
         }

         return newState;
      });
   };

   return (
      <div className="flex h-screen bg-gray-100">
         <div className="flex-grow">
            <h1 className="text-3xl font-bold text-center py-4">Yu-Gi-Oh! Game vs AI</h1>
            <GameBoard gameState={gameState} onAction={handleAction} />
         </div>
         <MessageLog messages={gameState.messages} />
      </div>
   );
};

export default App;