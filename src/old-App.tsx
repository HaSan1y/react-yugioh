import React, { useState, useEffect } from 'react';
import { GameState, Card, Player, Action, Phase } from './types';
import GameBoard from './components/GameBoard';
import { initialCards } from './data/cards.ts';

const createInitialPlayer = (name: string): Player => ({
   name,
   hand: [],
   monsterField: Array(5).fill(null),
   spellTrapField: Array(5).fill(null),
   graveyard: [],
   lifePoints: 8000,
   normalSummonUsed: false,
});

const App: React.FC = () => {
   const [gameState, setGameState] = useState<GameState>({
      players: [createInitialPlayer('Player'), createInitialPlayer('AI')],
      currentPlayerIndex: 0,
      phase: 'draw',
      turn: 1,
      selectedCard: null,
      chain: [],
      actionLog: [], // Add this line
   });

   useEffect(() => {
      // Initialize the game
      setGameState((prevState) => {
         const newState = { ...prevState, chain: [...prevState.chain] };
         newState.players.forEach((player) => {
            for (let i = 0; i < 5; i++) {
               const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
               player.hand.push({ ...randomCard, id: `${randomCard.id}-${Math.random()}`, position: 'attack' });
            }
         });
         return newState;
      });
   }, []);

   const handleAction = (action: Action) => {
      setGameState((prevState) => {
         let newState = {
            ...prevState,
            chain: [...prevState.chain],
            actionLog: [...prevState.actionLog, action], // Add the new action to the log
         };;
         const currentPlayer = newState.players[action.playerIndex];
         const opponentIndex = action.playerIndex === 0 ? 1 : 0;
         const opponent = newState.players[opponentIndex];

         switch (action.type) {
            case 'summon':
               if (action.cardIndex !== undefined) {
                  const card = currentPlayer.hand[action.cardIndex];
                  if (card.type === 'Monster' && !currentPlayer.normalSummonUsed) {
                     if (!card.tributesRequired || card.tributesRequired === 0) {
                        const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                        if (emptySlot !== -1) {
                           currentPlayer.monsterField[emptySlot] = { ...card, position: 'attack' };
                           currentPlayer.hand.splice(action.cardIndex, 1);
                           currentPlayer.normalSummonUsed = true;
                        }
                     }
                  }
               }
               break;
            case 'specialSummon':
               if (action.cardIndex !== undefined) {
                  const card = currentPlayer.hand[action.cardIndex];
                  if (card.type === 'Monster') {
                     const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                     if (emptySlot !== -1) {
                        currentPlayer.monsterField[emptySlot] = { ...card, position: 'attack' };
                        currentPlayer.hand.splice(action.cardIndex, 1);
                     }
                  }
               }
               break;
            case 'set':
               if (action.cardIndex !== undefined) {
                  const card = currentPlayer.hand[action.cardIndex];
                  const field = card.type === 'Spell' || card.type === 'Trap' ? currentPlayer.spellTrapField : currentPlayer.monsterField;
                  const emptySlot = field.findIndex(slot => slot === null);
                  if (emptySlot !== -1) {
                     field[emptySlot] = { ...card, position: action.type === 'set' ? 'set' : 'attack' };
                     currentPlayer.hand.splice(action.cardIndex, 1);
                  }
               }
               break;
            case 'flip':
               if (action.cardIndex !== undefined) {
                  const card = currentPlayer.monsterField[action.cardIndex];
                  if (card && card.position === 'set') {
                     card.position = 'defense';
                  }
               }
               break;
            case 'selectCard':
               newState.selectedCard = action.cardIndex !== undefined ? { playerIndex: action.playerIndex, cardIndex: action.cardIndex } : null;
               break;
            // if (action.cardIndex !== undefined && action.tributeIndices !== undefined) {
            //    const card = currentPlayer.hand[action.cardIndex];
            //    if (card.type === 'Monster' && card.tributesRequired && card.tributesRequired <= action.tributeIndices.length) {
            //       if (!currentPlayer.normalSummonUsed) {
            //          const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
            //          if (emptySlot !== -1) {
            //             // Remove tributes
            //             action.tributeIndices.forEach(index => {
            //                const tributedCard = currentPlayer.monsterField[index];
            //                if (tributedCard) {
            //                   currentPlayer.graveyard.push(tributedCard);
            //                   currentPlayer.monsterField[index] = null;
            //                }
            //             });
            //             // Summon the new monster
            //             currentPlayer.monsterField[emptySlot] = { ...card, position: 'attack' };
            //             currentPlayer.hand.splice(action.cardIndex, 1);
            //             currentPlayer.normalSummonUsed = true;
            //          }
            //       }
            //    }
            // }
            // break;
            case 'tribute': {
               if (action.cardIndex === undefined || action.tributeIndices === undefined) {
                  console.error('Tribute action missing cardIndex or tributeIndices');
                  break;
               }
               const card = currentPlayer.hand[action.cardIndex];
               if (!card || card.type !== 'Monster' || !card.tributesRequired || card.tributesRequired > action.tributeIndices.length) {
                  console.error('Invalid card for tribute summon');
                  break;
               }
               if (currentPlayer.normalSummonUsed) {
                  console.error('Normal summon already used this turn');
                  break;
               }
               if (action.cardIndex !== undefined && action.tributeIndices !== undefined) {
                  const card = currentPlayer.hand[action.cardIndex];
                  if (card && card.type === 'Monster' && card.tributesRequired && card.tributesRequired <= action.tributeIndices.length) {
                     if (!currentPlayer.normalSummonUsed) {
                        const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
                        if (emptySlot !== -1) {
                           // Remove tributes
                           action.tributeIndices.forEach(index => {
                              const tributedCard = currentPlayer.monsterField[index];
                              if (tributedCard) {
                                 currentPlayer.graveyard.push(tributedCard);
                                 currentPlayer.monsterField[index] = null;
                              }
                           });
                           // Summon the new monster
                           currentPlayer.monsterField[emptySlot] = { ...card, position: 'attack' };
                           currentPlayer.hand.splice(action.cardIndex, 1); // This line should now work without errors
                           currentPlayer.normalSummonUsed = true;
                        }
                     }
                  }
               }
               break;
            }
            case 'attack':
               if (newState.selectedCard && action.targetIndex !== undefined) {
                  const attackingCard = currentPlayer.monsterField[newState.selectedCard.cardIndex];
                  const targetCard = opponent.monsterField[action.targetIndex];
                  if (attackingCard && targetCard) {
                     if (targetCard.position === 'attack') {
                        if (attackingCard.attack > targetCard.attack) {
                           opponent.lifePoints -= attackingCard.attack - targetCard.attack;
                           opponent.monsterField[action.targetIndex] = null;
                           opponent.graveyard.push(targetCard);
                        } else if (attackingCard.attack < targetCard.attack) {
                           currentPlayer.lifePoints -= targetCard.attack - attackingCard.attack;
                           currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                           currentPlayer.graveyard.push(attackingCard);
                        } else {
                           currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                           opponent.monsterField[action.targetIndex] = null;
                           currentPlayer.graveyard.push(attackingCard);
                           opponent.graveyard.push(targetCard);
                        }
                        if (newState.selectedCard && action.targetIndex !== undefined) {
                           const attackingCard = currentPlayer.monsterField[newState.selectedCard.cardIndex];
                           const targetCard = opponent.monsterField[action.targetIndex];
                           if (attackingCard && targetCard) {
                              if (targetCard.position === 'set') {
                                 targetCard.position = 'defense';
                                 if (targetCard.name === 'Marshmallon') {
                                    currentPlayer.lifePoints -= 1000;
                                 }
                              }
                              if (targetCard.position === 'attack') {
                                 if (attackingCard.attack > targetCard.attack) {
                                    opponent.lifePoints -= attackingCard.attack - targetCard.attack;
                                    if (targetCard.name !== 'Marshmallon') {
                                       opponent.monsterField[action.targetIndex] = null;
                                       opponent.graveyard.push(targetCard);
                                    }
                                 } else if (attackingCard.attack < targetCard.attack) {
                                    currentPlayer.lifePoints -= targetCard.attack - attackingCard.attack;
                                    currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                                    currentPlayer.graveyard.push(attackingCard);
                                 } else {
                                    if (targetCard.name !== 'Marshmallon') {
                                       opponent.monsterField[action.targetIndex] = null;
                                       opponent.graveyard.push(targetCard);
                                    }
                                    currentPlayer.monsterField[newState.selectedCard.cardIndex] = null;
                                    currentPlayer.graveyard.push(attackingCard);
                                 }
                              } else { // Defense position
                                 if (attackingCard.attack > targetCard.defense) {
                                    if (targetCard.name !== 'Marshmallon') {
                                       opponent.monsterField[action.targetIndex] = null;
                                       opponent.graveyard.push(targetCard);
                                    }
                                 } else if (attackingCard.attack < targetCard.defense) {
                                    currentPlayer.lifePoints -= targetCard.defense - attackingCard.attack;
                                 }
                              }
                           }
                           newState.selectedCard = null;
                        }
                        break;
                     } else {
                        if (attackingCard.attack > targetCard.defense) {
                           opponent.monsterField[action.targetIndex] = null;
                           opponent.graveyard.push(targetCard);
                        } else if (attackingCard.attack < targetCard.defense) {
                           currentPlayer.lifePoints -= targetCard.defense - attackingCard.attack;
                        }
                     }
                  }
                  newState.selectedCard = null;
               }
               break;
            case 'activateSpell':
               if (action.cardIndex !== undefined) {
                  const card = currentPlayer.spellTrapField[action.cardIndex];
                  if (card && card.type === 'Spell') {
                     // Implement spell card effects here
                     console.log(`Activated spell: ${card.name}`);
                     currentPlayer.spellTrapField[action.cardIndex] = null;
                     currentPlayer.graveyard.push(card);
                  }
               }
               break;
            case 'endPhase': {
               const phases: Phase[] = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];
               const currentPhaseIndex = phases.indexOf(newState.phase);
               newState.phase = phases[(currentPhaseIndex + 1) % phases.length];
               break;
            }
            case 'endTurn': {
               newState.currentPlayerIndex = newState.currentPlayerIndex === 0 ? 1 : 0;
               newState.phase = 'draw';
               newState.turn++;
               newState.selectedCard = null;
               // Draw a card for the new player
               const newCurrentPlayer = newState.players[newState.currentPlayerIndex];
               newCurrentPlayer.normalSummonUsed = false;
               if (newCurrentPlayer.hand.length < 6) {
                  const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
                  newCurrentPlayer.hand.push({ ...randomCard, id: `${randomCard.id}-${Math.random()}`, position: 'attack' });
               }
               // If it's the AI's turn, perform AI actions
               if (newState.currentPlayerIndex === 1) {
                  performAIActions(newState);
               }
            }
               break;
         }
         newState = checkAndActivateEffects(newState);
         return newState;
      });
   };
   const checkAndActivateEffects = (state: GameState) => {
      state.players.forEach((player, playerIndex) => {
         player.monsterField.forEach((card, cardIndex) => {
            if (card && card.effect && card.effectCondition) {
               try {

                  if (card.effectCondition(state)) {
                     // Effect condition is met, activate the effect
                     state = card.effect(state);

                     // Add the activated effect to the chain
                     state.chain.push({ card, player });

                     // If it's a trigger effect, we might want to give the opponent a chance to respond
                     if (card.effectType === 'trigger') {
                        // Implement logic for opponent to respond
                     }
                  }
               } catch (error) {
                  console.error(`Error checking effect condition for card ${card.name}:`, error);
               }
            }
         });
      });

      // Resolve the chain
      while (state.chain.length > 0) {
         const { card, player } = state.chain.pop()!;
         if (card.effect) {
            state = card.effect(state);
         }
      }

      state.chain = [];
      return state;
   };
   const performAIActions = (state: GameState) => {
      const aiPlayer = state.players[1];
      const humanPlayer = state.players[0];

      // Simple AI logic: Summon strongest monster and attack if possible
      const strongestCard = aiPlayer.hand.reduce((prev, current) => (current.attack > prev.attack ? current : prev), aiPlayer.hand[0]);
      if (strongestCard && strongestCard.type !== 'Spell' && strongestCard.type !== 'Trap') {
         const emptyMonsterSlot = aiPlayer.monsterField.findIndex(slot => slot === null);
         if (emptyMonsterSlot !== -1) {
            handleAction({ type: 'summon', playerIndex: 1, cardIndex: aiPlayer.hand.indexOf(strongestCard) });
         }
      }

      // Activate spells
      aiPlayer.spellTrapField.forEach((card, index) => {
         if (card && card.type === 'Spell') {
            handleAction({ type: 'activateSpell', playerIndex: 1, cardIndex: index });
         }
      });

      // Attack with all monsters
      aiPlayer.monsterField.forEach((card, index) => {
         if (card) {
            handleAction({ type: 'selectCard', playerIndex: 1, cardIndex: index });
            const targetIndex = humanPlayer.monsterField.findIndex(slot => slot !== null);
            if (targetIndex !== -1) {
               handleAction({ type: 'attack', playerIndex: 1, targetIndex });
            } else {
               // Direct attack
               humanPlayer.lifePoints -= card.attack;
            }
         }
      });

      // End turn
      handleAction({ type: 'endTurn', playerIndex: 1 });
   };

   return (
      <div className="min-h-screen bg-gray-100">
         <h1 className="text-3xl font-bold text-center py-4">Yu-Gi-Oh! Game vs AI</h1>
         <GameBoard gameState={gameState} onAction={handleAction} />
      </div>
   );
};

export default App;