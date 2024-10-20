import { Card, GameState } from '../types';

export const initialCards: Card[] = [
  {
    id: '1',
    name: 'Dark Magician',
    type: 'Monster',
    attack: 2500,
    defense: 2100,
    level: 7,
    attribute: 'Dark',
    description: 'The ultimate wizard in terms of attack and defense.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'tribute',
    tributesRequired: 2,
  },
  {
    id: '2',
    name: 'Blue-Eyes White Dragon',
    type: 'Monster',
    attack: 3000,
    defense: 2500,
    level: 8,
    attribute: 'Light',
    description: 'This legendary dragon is a powerful engine of destruction.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'tribute',
    tributesRequired: 2,
  },
  {
    id: '3',
    name: 'Kuriboh',
    type: 'Monster',
    attack: 300,
    defense: 200,
    level: 1,
    attribute: 'Dark',
    description: 'During damage calculation, if your opponent\'s monster attacks (Quick Effect): You can discard this card; you take no battle damage from that battle.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'normal',
    effect: (gameState: GameState, playerIndex: number) => {
      gameState.players[playerIndex].lifePoints += 1000;
      gameState.messages.push(`${gameState.players[playerIndex].name} gained 1000 Life Points from Kuriboh's effect.`);
      return gameState;
    },
  },
  {
    id: '4',
    name: 'Monster Reborn',
    type: 'Spell',
    description: 'Target 1 monster in either player\'s GY; Special Summon it.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'set',
    effect: (gameState: GameState, playerIndex: number) => {
      const player = gameState.players[playerIndex];
      const opponent = gameState.players[1 - playerIndex];
      const allGraveyardMonsters = [...player.graveyard, ...opponent.graveyard].filter(card => card.type === 'Monster');

      if (allGraveyardMonsters.length > 0) {
        const randomMonster = allGraveyardMonsters[Math.floor(Math.random() * allGraveyardMonsters.length)];
        const emptySlot = player.monsterField.findIndex(slot => slot === null);

        if (emptySlot !== -1) {
          player.monsterField[emptySlot] = { ...randomMonster, position: 'attack', summonType: 'special' };
          const graveyard = randomMonster.id.startsWith(player.name) ? player.graveyard : opponent.graveyard;
          const index = graveyard.findIndex(card => card.id === randomMonster.id);
          if (index !== -1) {
            graveyard.splice(index, 1);
          }
          gameState.messages.push(`${player.name} special summoned ${randomMonster.name} from the graveyard.`);
        }
      }

      return gameState;
    },
  },
  {
    id: '5',
    name: 'Mirror Force',
    type: 'Trap',
    description: 'When an opponent\'s monster declares an attack: Destroy all your opponent\'s Attack Position monsters.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'set',
    effect: (gameState: GameState, playerIndex: number) => {
      const opponent = gameState.players[1 - playerIndex];
      const destroyedMonsters: string[] = [];
      opponent.monsterField.forEach((monster, index) => {
        if (monster && monster.position === 'attack') {
          destroyedMonsters.push(monster.name);
          opponent.graveyard.push(monster);
          opponent.monsterField[index] = null;
        }
      });
      if (destroyedMonsters.length > 0) {
        gameState.messages.push(`Mirror Force activated! Destroyed: ${destroyedMonsters.join(', ')}`);
      }
      return gameState;
    },
  },
  {
    id: '6',
    name: 'Mystic Tomato',
    type: 'Monster',
    attack: 1400,
    defense: 1100,
    level: 4,
    attribute: 'Dark',
    description: 'When this card is destroyed by battle and sent to the GY: You can Special Summon 1 DARK monster with 1500 or less ATK from your Deck in face-up Attack Position.',
    image: 'https://example.com/mystic-tomato.jpg',
    position: 'attack',
    effectType: 'trigger',
    effectCondition: (gameState: GameState) => {
      // Check if this card was just destroyed by battle
      const lastAction = gameState.actionLog[gameState.actionLog.length - 1];
      return lastAction.type === 'battle' && lastAction.destroyedCards?.includes('6');
    },
    effect: (gameState: GameState) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const darkMonsters = currentPlayer.deck.filter(card => card.attribute === 'Dark' && card.attack <= 1500);
      if (darkMonsters.length > 0) {
        const summonedMonster = darkMonsters[Math.floor(Math.random() * darkMonsters.length)];
        const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
          currentPlayer.monsterField[emptySlot] = { ...summonedMonster, position: 'attack' };
          currentPlayer.deck = currentPlayer.deck.filter(card => card.id !== summonedMonster.id);
        }
      }
      return gameState;
    },
  },
  {
    id: '7',
    name: 'Cyber Dragon',
    type: 'Monster',
    attack: 2100,
    defense: 1600,
    level: 5,
    attribute: 'Light',
    description: 'If only your opponent controls a monster, you can Special Summon this card (from your hand).',
    image: 'https://example.com/cyber-dragon.jpg',
    position: 'attack',
    effectType: 'ignition',
    effectCondition: (gameState: GameState) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const opponent = gameState.players[1 - gameState.currentPlayerIndex];
      return currentPlayer.monsterField.every(slot => slot === null) && opponent.monsterField.some(slot => slot !== null);
    },
    effect: (gameState: GameState) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const emptySlot = currentPlayer.monsterField.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        const cyberDragonIndex = currentPlayer.hand.findIndex(card => card.id === '8');
        if (cyberDragonIndex !== -1) {
          currentPlayer.monsterField[emptySlot] = { ...currentPlayer.hand[cyberDragonIndex], position: 'attack' };
          currentPlayer.hand.splice(cyberDragonIndex, 1);
        }
      }
      return gameState;
    },
  },
  {
    id: '8',
    name: 'Marshmallon',
    type: 'Monster',
    attack: 300,
    defense: 500,
    level: 3,
    attribute: 'Light',
    description: 'Cannot be destroyed by battle. After damage calculation, if this card was attacked, and was face-down at the start of the Damage Step: The attacking player takes 1000 damage.',
    image: 'https://example.com/marshmallon.jpg',
    position: 'set',
    effectType: 'continuous',
    effectCondition: (gameState: GameState) => true, // Always active
    effect: (gameState: GameState) => {
      // This effect is handled in the battle resolution logic
      return gameState;
    },
  },
  {
    id: '9',
    name: 'Summoned Skull',
    type: 'Monster',
    attack: 2500,
    defense: 1200,
    level: 6,
    attribute: 'Dark',
    description: 'A fiend with dark powers for confusing the enemy. Among the Fiend-Type monsters, this monster boasts considerable force.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'tribute',
    tributesRequired: 1,
  },
  {
    id: '10',
    name: 'Mystical Elf',
    type: 'Monster',
    attack: 800,
    defense: 2000,
    level: 4,
    attribute: 'Light',
    description: 'A delicate elf that lacks offense, but has a terrific defense backed by mystical power.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'normal',
  },
  {
    id: '13',
    name: 'Polymerization',
    type: 'Spell',
    description: 'Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand or field as Fusion Material.',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'set',
    effect: (gameState: GameState, playerIndex: number) => {
      // Implement fusion summon logic here
      gameState.messages.push(`${gameState.players[playerIndex].name} activated Polymerization.`);
      return gameState;
    },
  },
  {
    id: '14',
    name: 'Dark Paladin',
    type: 'Monster',
    attack: 2900,
    defense: 2400,
    level: 8,
    attribute: 'Dark',
    description: '"Dark Magician" + "Buster Blader"',
    image: 'https://images.unsplash.com/photo-1589380370659-6f58cdbb4d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    position: 'attack',
    summonType: 'fusion',
    fusionMaterials: ['Dark Magician', 'Buster Blader'],
  },
  // {
  //   id: '7',
  //   name: 'Sangan',
  //   type: 'Monster',
  //   attack: 1000,
  //   defense: 600,
  //   level: 3,
  //   attribute: 'Dark',
  //   description: 'If this card is sent from the field to the GY: Add 1 monster with 1500 or less ATK from your Deck to your hand.',
  //   image: 'https://example.com/sangan.jpg',
  //   position: 'attack',
  //   effectType: 'trigger',
  //   effectCondition: (gameState: GameState) => {
  //     // Check if this card was just sent from the field to the GY
  //     const lastAction = gameState.actionLog[gameState.actionLog.length - 1];
  //     return lastAction?.type === 'sendToGraveyard' && lastAction.cards?.includes('7');
  //   },
  //   effect: (gameState: GameState) => {
  //     const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  //     const eligibleMonsters = currentPlayer.deck.filter(card => card.type === 'Monster' && card.attack <= 1500);
  //     if (eligibleMonsters.length > 0) {
  //       const addedMonster = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)];
  //       currentPlayer.hand.push(addedMonster);
  //       currentPlayer.deck = currentPlayer.deck.filter(card => card.id !== addedMonster.id);
  //     }
  //     return gameState;
  //   },
  // },
];
