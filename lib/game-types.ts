// Game state types for Delhi Monopoly

export interface Player {
  id: number;
  name: string;
  color: string;
  token: string;
  position: number;
  money: number;
  properties: number[]; // tile IDs
  houses: Record<number, number>; // tileId -> number of houses (5 = hotel)
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
}

export interface OwnedProperty {
  tileId: number;
  ownerId: number;
  mortgaged: boolean;
  houses: number; // 0-4 houses, 5 = hotel
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  ownedProperties: Record<number, OwnedProperty>;
  phase: GamePhase;
  dice: [number, number];
  doublesCount: number;
  lastDiceRoll: [number, number] | null;
  currentCard: { text: string; action: string; value: number } | null;
  winner: number | null;
  turnActions: TurnAction[];
  freeParkingMoney: number;
}

export type GamePhase = 
  | 'waiting' // Waiting for players
  | 'rolling' // Player needs to roll
  | 'moving' // Animating player movement
  | 'landed' // Player landed, processing tile
  | 'buying' // Player can buy property
  | 'paying-rent' // Player must pay rent
  | 'card' // Drawing chance/community chest
  | 'jail-decision' // Player in jail, deciding what to do
  | 'end-turn' // Player can end turn or manage properties
  | 'game-over'; // Game finished

export type TurnAction = 
  | { type: 'roll'; dice: [number, number] }
  | { type: 'move'; from: number; to: number }
  | { type: 'buy'; tileId: number; price: number }
  | { type: 'pay-rent'; to: number; amount: number }
  | { type: 'card'; text: string }
  | { type: 'jail' }
  | { type: 'pass-go' }
  | { type: 'tax'; amount: number };

export interface GameAction {
  type: string;
  payload?: Record<string, unknown>;
}
