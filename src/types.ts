export interface Card {
  id: string;
  name: string;
  type: 'Monster' | 'Spell' | 'Trap';
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  description: string;
  image: string;
  position: 'attack' | 'defense' | 'set';
  effect?: (gameState: GameState) => GameState;
  effectType?: 'ignition' | 'trigger' | 'continuous';
  effectCondition?: (gameState: GameState) => boolean;
  tributesRequired?: number;

}

export interface Player {
  name: string;
  hand: Card[];
  monsterField: (Card | null)[];
  spellTrapField: (Card | null)[];
  graveyard: Card[];
  lifePoints: number;
  normalSummonUsed: boolean;
}

export type Phase = 'draw' | 'standby' | 'main1' | 'battle' | 'main2' | 'end';

export interface GameState {
  players: [Player, Player];
  currentPlayerIndex: number;
  phase: Phase;
  turn: number;
  selectedCard: { playerIndex: number; cardIndex: number } | null;
  chain: { card: Card, player: Player }[];
  actionLog: Action[]; // Add this line
}

export interface Action {
  type: 'summon' | 'set' | 'flip' | 'attack' | 'activateSpell' | 'activateTrap' | 'endPhase' | 'endTurn' | 'selectCard' | 'tribute' | 'specialSummon';
  playerIndex: number;
  cardIndex?: number;
  targetIndex?: number;
  tributeIndices?: number[];
  specialSummon?: number[];
}