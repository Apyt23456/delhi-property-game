'use client';

import { useState, useCallback } from 'react';
import { GameState, Player, OwnedProperty, GamePhase } from '@/lib/game-types';
import { 
  TILES, 
  CHANCE_CARDS, 
  COMMUNITY_CHEST_CARDS, 
  PLAYER_COLORS, 
  PLAYER_TOKENS,
  PropertyGroup 
} from '@/lib/game-data';

const STARTING_MONEY = 1500;
const GO_SALARY = 200;
const INCOME_TAX = 200;
const LUXURY_TAX = 100;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useGame(playerCount: number = 2) {
  const [chanceCards] = useState(() => shuffleArray(CHANCE_CARDS));
  const [communityChestCards] = useState(() => shuffleArray(COMMUNITY_CHEST_CARDS));
  const [chanceIndex, setChanceIndex] = useState(0);
  const [communityIndex, setCommunityIndex] = useState(0);

  const initializePlayers = useCallback((): Player[] => {
    return Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      color: PLAYER_COLORS[i],
      token: PLAYER_TOKENS[i],
      position: 0,
      money: STARTING_MONEY,
      properties: [],
      houses: {},
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      isBankrupt: false,
    }));
  }, [playerCount]);

  const [gameState, setGameState] = useState<GameState>(() => ({
    players: initializePlayers(),
    currentPlayerIndex: 0,
    ownedProperties: {},
    phase: 'rolling',
    dice: [1, 1],
    doublesCount: 0,
    lastDiceRoll: null,
    currentCard: null,
    winner: null,
    turnActions: [],
    freeParkingMoney: 0,
  }));

  const [isAnimating, setIsAnimating] = useState(false);

  const rollDice = useCallback((): [number, number] => {
    return [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
  }, []);

  const getCurrentPlayer = useCallback(() => {
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState.players, gameState.currentPlayerIndex]);

  const getActivePlayers = useCallback(() => {
    return gameState.players.filter(p => !p.isBankrupt);
  }, [gameState.players]);

  const countOwnedInGroup = useCallback((playerId: number, group: PropertyGroup): number => {
    return Object.values(gameState.ownedProperties)
      .filter(op => {
        const tile = TILES[op.tileId];
        return op.ownerId === playerId && tile.property?.group === group && !op.mortgaged;
      })
      .length;
  }, [gameState.ownedProperties]);

  const getGroupSize = useCallback((group: PropertyGroup): number => {
    return TILES.filter(t => t.property?.group === group).length;
  }, []);

  const ownsFullGroup = useCallback((playerId: number, group: PropertyGroup): boolean => {
    return countOwnedInGroup(playerId, group) === getGroupSize(group);
  }, [countOwnedInGroup, getGroupSize]);

  const calculateRent = useCallback((tileId: number, diceTotal: number): number => {
    const tile = TILES[tileId];
    const owned = gameState.ownedProperties[tileId];
    
    if (!tile.property || !owned || owned.mortgaged) return 0;

    const property = tile.property;
    
    // Railways
    if (property.group === 'railway') {
      const railwaysOwned = countOwnedInGroup(owned.ownerId, 'railway');
      return property.rent[railwaysOwned - 1] || 25;
    }

    // Utilities
    if (property.group === 'utility') {
      const utilitiesOwned = countOwnedInGroup(owned.ownerId, 'utility');
      const multiplier = utilitiesOwned === 2 ? 10 : 4;
      return diceTotal * multiplier;
    }

    // Regular properties
    const houses = owned.houses;
    if (houses > 0) {
      return property.rent[houses];
    }

    // Double rent for full set with no houses
    const baseRent = property.rent[0];
    if (ownsFullGroup(owned.ownerId, property.group)) {
      return baseRent * 2;
    }

    return baseRent;
  }, [gameState.ownedProperties, countOwnedInGroup, ownsFullGroup]);

  const updatePlayer = useCallback((playerId: number, updates: Partial<Player>) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const setPhase = useCallback((phase: GamePhase) => {
    setGameState(prev => ({ ...prev, phase }));
  }, []);

  const addMoney = useCallback((playerId: number, amount: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, money: p.money + amount } : p
      ),
    }));
  }, []);

  const removeMoney = useCallback((playerId: number, amount: number): boolean => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;
    
    if (player.money >= amount) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === playerId ? { ...p, money: p.money - amount } : p
        ),
      }));
      return true;
    }
    return false;
  }, [gameState.players]);

  const handleMovement = useCallback(async (newPosition: number, passedGo: boolean) => {
    const player = getCurrentPlayer();
    
    if (passedGo && newPosition !== 10) { // Don't collect if going to jail
      addMoney(player.id, GO_SALARY);
    }

    updatePlayer(player.id, { position: newPosition });

    // Process landing
    const tile = TILES[newPosition];
    
    switch (tile.type) {
      case 'go':
        setPhase('end-turn');
        break;
        
      case 'property':
      case 'railway':
      case 'utility':
        const owned = gameState.ownedProperties[newPosition];
        if (!owned) {
          setPhase('buying');
        } else if (owned.ownerId !== player.id && !owned.mortgaged) {
          setPhase('paying-rent');
        } else {
          setPhase('end-turn');
        }
        break;
        
      case 'community-chest':
      case 'chance':
        const cards = tile.type === 'chance' ? chanceCards : communityChestCards;
        const index = tile.type === 'chance' ? chanceIndex : communityIndex;
        const card = cards[index % cards.length];
        
        if (tile.type === 'chance') {
          setChanceIndex(prev => prev + 1);
        } else {
          setCommunityIndex(prev => prev + 1);
        }
        
        setGameState(prev => ({ ...prev, currentCard: card }));
        setPhase('card');
        break;
        
      case 'income-tax':
        if (removeMoney(player.id, INCOME_TAX)) {
          setGameState(prev => ({ 
            ...prev, 
            freeParkingMoney: prev.freeParkingMoney + INCOME_TAX 
          }));
        }
        setPhase('end-turn');
        break;
        
      case 'luxury-tax':
        if (removeMoney(player.id, LUXURY_TAX)) {
          setGameState(prev => ({ 
            ...prev, 
            freeParkingMoney: prev.freeParkingMoney + LUXURY_TAX 
          }));
        }
        setPhase('end-turn');
        break;
        
      case 'jail':
        setPhase('end-turn'); // Just visiting
        break;
        
      case 'free-parking':
        // Collect free parking money (house rule)
        if (gameState.freeParkingMoney > 0) {
          addMoney(player.id, gameState.freeParkingMoney);
          setGameState(prev => ({ ...prev, freeParkingMoney: 0 }));
        }
        setPhase('end-turn');
        break;
        
      case 'go-to-jail':
        updatePlayer(player.id, { position: 10, inJail: true, jailTurns: 0 });
        setPhase('end-turn');
        break;
    }
  }, [getCurrentPlayer, addMoney, updatePlayer, removeMoney, gameState.ownedProperties, gameState.freeParkingMoney, chanceCards, communityChestCards, chanceIndex, communityIndex, setPhase]);

  const handleRoll = useCallback(async () => {
    if (gameState.phase !== 'rolling' && gameState.phase !== 'jail-decision') return;
    if (isAnimating) return;

    const player = getCurrentPlayer();
    const dice = rollDice();
    const isDoubles = dice[0] === dice[1];
    const total = dice[0] + dice[1];

    setGameState(prev => ({ 
      ...prev, 
      dice, 
      lastDiceRoll: dice,
      doublesCount: isDoubles ? prev.doublesCount + 1 : 0,
    }));

    // Handle jail
    if (player.inJail) {
      if (isDoubles) {
        updatePlayer(player.id, { inJail: false, jailTurns: 0 });
        const newPos = (player.position + total) % 40;
        setIsAnimating(true);
        setTimeout(() => {
          handleMovement(newPos, newPos < player.position);
          setIsAnimating(false);
        }, 500);
      } else {
        const newJailTurns = player.jailTurns + 1;
        if (newJailTurns >= 3) {
          // Must pay and leave
          removeMoney(player.id, 50);
          updatePlayer(player.id, { inJail: false, jailTurns: 0 });
          const newPos = (player.position + total) % 40;
          setIsAnimating(true);
          setTimeout(() => {
            handleMovement(newPos, newPos < player.position);
            setIsAnimating(false);
          }, 500);
        } else {
          updatePlayer(player.id, { jailTurns: newJailTurns });
          setPhase('end-turn');
        }
      }
      return;
    }

    // Three doubles = go to jail
    if (gameState.doublesCount + (isDoubles ? 1 : 0) >= 3) {
      updatePlayer(player.id, { position: 10, inJail: true, jailTurns: 0 });
      setGameState(prev => ({ ...prev, doublesCount: 0 }));
      setPhase('end-turn');
      return;
    }

    // Normal movement
    setPhase('moving');
    setIsAnimating(true);
    
    const newPosition = (player.position + total) % 40;
    const passedGo = newPosition < player.position;

    setTimeout(() => {
      handleMovement(newPosition, passedGo);
      setIsAnimating(false);
    }, 500);
  }, [gameState.phase, gameState.doublesCount, isAnimating, getCurrentPlayer, rollDice, updatePlayer, removeMoney, handleMovement, setPhase]);

  const handleBuyProperty = useCallback(() => {
    const player = getCurrentPlayer();
    const tile = TILES[player.position];
    
    if (!tile.property) return;
    if (player.money < tile.property.price) return;

    removeMoney(player.id, tile.property.price);
    
    const newOwned: OwnedProperty = {
      tileId: player.position,
      ownerId: player.id,
      mortgaged: false,
      houses: 0,
    };

    setGameState(prev => ({
      ...prev,
      ownedProperties: { ...prev.ownedProperties, [player.position]: newOwned },
      players: prev.players.map(p => 
        p.id === player.id 
          ? { ...p, properties: [...p.properties, player.position] }
          : p
      ),
    }));

    setPhase('end-turn');
  }, [getCurrentPlayer, removeMoney, setPhase]);

  const handleDeclineBuy = useCallback(() => {
    setPhase('end-turn');
  }, [setPhase]);

  const handlePayRent = useCallback(() => {
    const player = getCurrentPlayer();
    const owned = gameState.ownedProperties[player.position];
    
    if (!owned) return;

    const diceTotal = (gameState.lastDiceRoll?.[0] || 0) + (gameState.lastDiceRoll?.[1] || 0);
    const rent = calculateRent(player.position, diceTotal);

    if (removeMoney(player.id, rent)) {
      addMoney(owned.ownerId, rent);
    } else {
      // Player is bankrupt
      updatePlayer(player.id, { isBankrupt: true });
      // Transfer properties to owner
      const bankrupt = gameState.players.find(p => p.id === player.id);
      if (bankrupt) {
        bankrupt.properties.forEach(propId => {
          setGameState(prev => ({
            ...prev,
            ownedProperties: {
              ...prev.ownedProperties,
              [propId]: { ...prev.ownedProperties[propId], ownerId: owned.ownerId },
            },
          }));
        });
      }
    }

    // Check for winner
    const activePlayers = getActivePlayers();
    if (activePlayers.length === 1) {
      setGameState(prev => ({ ...prev, winner: activePlayers[0].id, phase: 'game-over' }));
      return;
    }

    setPhase('end-turn');
  }, [getCurrentPlayer, gameState.ownedProperties, gameState.lastDiceRoll, gameState.players, calculateRent, removeMoney, addMoney, updatePlayer, getActivePlayers, setPhase]);

  const handleCard = useCallback(() => {
    const player = getCurrentPlayer();
    const card = gameState.currentCard;
    
    if (!card) {
      setPhase('end-turn');
      return;
    }

    switch (card.action) {
      case 'move':
        const passedGo = card.value < player.position && card.value !== 10;
        updatePlayer(player.id, { position: card.value });
        handleMovement(card.value, passedGo);
        break;
        
      case 'back':
        const newPos = (player.position - card.value + 40) % 40;
        updatePlayer(player.id, { position: newPos });
        handleMovement(newPos, false);
        break;
        
      case 'receive':
        addMoney(player.id, card.value);
        setPhase('end-turn');
        break;
        
      case 'pay':
        removeMoney(player.id, card.value);
        setGameState(prev => ({ 
          ...prev, 
          freeParkingMoney: prev.freeParkingMoney + card.value 
        }));
        setPhase('end-turn');
        break;
        
      case 'jail':
        updatePlayer(player.id, { position: 10, inJail: true, jailTurns: 0 });
        setPhase('end-turn');
        break;
        
      case 'jail-card':
        updatePlayer(player.id, { jailFreeCards: player.jailFreeCards + 1 });
        setPhase('end-turn');
        break;
        
      case 'pay-all':
        const otherPlayers = gameState.players.filter(p => p.id !== player.id && !p.isBankrupt);
        const totalPay = card.value * otherPlayers.length;
        if (removeMoney(player.id, totalPay)) {
          otherPlayers.forEach(p => addMoney(p.id, card.value));
        }
        setPhase('end-turn');
        break;
        
      case 'receive-all':
        gameState.players
          .filter(p => p.id !== player.id && !p.isBankrupt)
          .forEach(p => {
            removeMoney(p.id, card.value);
            addMoney(player.id, card.value);
          });
        setPhase('end-turn');
        break;
        
      case 'repairs':
        let repairCost = 0;
        player.properties.forEach(propId => {
          const houses = gameState.ownedProperties[propId]?.houses || 0;
          if (houses === 5) {
            repairCost += 100; // Hotel
          } else {
            repairCost += houses * 25;
          }
        });
        removeMoney(player.id, repairCost);
        setPhase('end-turn');
        break;
        
      default:
        setPhase('end-turn');
    }
    
    setGameState(prev => ({ ...prev, currentCard: null }));
  }, [getCurrentPlayer, gameState.currentCard, gameState.players, gameState.ownedProperties, updatePlayer, handleMovement, addMoney, removeMoney, setPhase]);

  const handleEndTurn = useCallback(() => {
    const isDoubles = gameState.lastDiceRoll?.[0] === gameState.lastDiceRoll?.[1];
    const player = getCurrentPlayer();
    
    // Roll again if doubles (and not in jail)
    if (isDoubles && !player.inJail && gameState.doublesCount < 3) {
      setPhase('rolling');
      return;
    }

    // Find next active player
    let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    while (gameState.players[nextIndex].isBankrupt) {
      nextIndex = (nextIndex + 1) % gameState.players.length;
    }

    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: nextIndex,
      phase: prev.players[nextIndex].inJail ? 'jail-decision' : 'rolling',
      doublesCount: 0,
      lastDiceRoll: null,
    }));
  }, [gameState.lastDiceRoll, gameState.currentPlayerIndex, gameState.players, gameState.doublesCount, getCurrentPlayer, setPhase]);

  const handlePayJailFine = useCallback(() => {
    const player = getCurrentPlayer();
    if (removeMoney(player.id, 50)) {
      updatePlayer(player.id, { inJail: false, jailTurns: 0 });
      setPhase('rolling');
    }
  }, [getCurrentPlayer, removeMoney, updatePlayer, setPhase]);

  const handleUseJailCard = useCallback(() => {
    const player = getCurrentPlayer();
    if (player.jailFreeCards > 0) {
      updatePlayer(player.id, { 
        inJail: false, 
        jailTurns: 0, 
        jailFreeCards: player.jailFreeCards - 1 
      });
      setPhase('rolling');
    }
  }, [getCurrentPlayer, updatePlayer, setPhase]);

  const handleBuyHouse = useCallback((tileId: number) => {
    const player = getCurrentPlayer();
    const tile = TILES[tileId];
    const owned = gameState.ownedProperties[tileId];
    
    if (!tile.property || !owned || owned.ownerId !== player.id) return;
    if (!ownsFullGroup(player.id, tile.property.group)) return;
    if (owned.houses >= 5) return;
    if (player.money < tile.property.houseCost) return;

    removeMoney(player.id, tile.property.houseCost);
    
    setGameState(prev => ({
      ...prev,
      ownedProperties: {
        ...prev.ownedProperties,
        [tileId]: { ...owned, houses: owned.houses + 1 },
      },
    }));
  }, [getCurrentPlayer, gameState.ownedProperties, ownsFullGroup, removeMoney]);

  const handleSellHouse = useCallback((tileId: number) => {
    const player = getCurrentPlayer();
    const tile = TILES[tileId];
    const owned = gameState.ownedProperties[tileId];
    
    if (!tile.property || !owned || owned.ownerId !== player.id) return;
    if (owned.houses <= 0) return;

    addMoney(player.id, Math.floor(tile.property.houseCost / 2));
    
    setGameState(prev => ({
      ...prev,
      ownedProperties: {
        ...prev.ownedProperties,
        [tileId]: { ...owned, houses: owned.houses - 1 },
      },
    }));
  }, [getCurrentPlayer, gameState.ownedProperties, addMoney]);

  const handleMortgage = useCallback((tileId: number) => {
    const player = getCurrentPlayer();
    const tile = TILES[tileId];
    const owned = gameState.ownedProperties[tileId];
    
    if (!tile.property || !owned || owned.ownerId !== player.id) return;
    if (owned.mortgaged) return;
    if (owned.houses > 0) return;

    addMoney(player.id, tile.property.mortgage);
    
    setGameState(prev => ({
      ...prev,
      ownedProperties: {
        ...prev.ownedProperties,
        [tileId]: { ...owned, mortgaged: true },
      },
    }));
  }, [getCurrentPlayer, gameState.ownedProperties, addMoney]);

  const handleUnmortgage = useCallback((tileId: number) => {
    const player = getCurrentPlayer();
    const tile = TILES[tileId];
    const owned = gameState.ownedProperties[tileId];
    
    if (!tile.property || !owned || owned.ownerId !== player.id) return;
    if (!owned.mortgaged) return;

    const cost = Math.floor(tile.property.mortgage * 1.1);
    if (player.money < cost) return;

    removeMoney(player.id, cost);
    
    setGameState(prev => ({
      ...prev,
      ownedProperties: {
        ...prev.ownedProperties,
        [tileId]: { ...owned, mortgaged: false },
      },
    }));
  }, [getCurrentPlayer, gameState.ownedProperties, removeMoney]);

  const resetGame = useCallback(() => {
    setGameState({
      players: initializePlayers(),
      currentPlayerIndex: 0,
      ownedProperties: {},
      phase: 'rolling',
      dice: [1, 1],
      doublesCount: 0,
      lastDiceRoll: null,
      currentCard: null,
      winner: null,
      turnActions: [],
      freeParkingMoney: 0,
    });
    setChanceIndex(0);
    setCommunityIndex(0);
  }, [initializePlayers]);

  return {
    gameState,
    isAnimating,
    handleRoll,
    handleBuyProperty,
    handleDeclineBuy,
    handlePayRent,
    handleCard,
    handleEndTurn,
    handlePayJailFine,
    handleUseJailCard,
    handleBuyHouse,
    handleSellHouse,
    handleMortgage,
    handleUnmortgage,
    resetGame,
    getCurrentPlayer,
    calculateRent,
    ownsFullGroup,
  };
}
