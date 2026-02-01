'use client';

import { GameState } from '@/lib/game-types';
import { TILES } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { Dice } from './dice';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  gameState: GameState;
  isAnimating: boolean;
  onRoll: () => void;
  onBuyProperty: () => void;
  onDeclineBuy: () => void;
  onPayRent: () => void;
  onDrawCard: () => void;
  onEndTurn: () => void;
  onPayJailFine: () => void;
  onUseJailCard: () => void;
  calculateRent: (tileId: number, diceTotal: number) => number;
}

export function GameControls({
  gameState,
  isAnimating,
  onRoll,
  onBuyProperty,
  onDeclineBuy,
  onPayRent,
  onDrawCard,
  onEndTurn,
  onPayJailFine,
  onUseJailCard,
  calculateRent,
}: GameControlsProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentTile = TILES[currentPlayer.position];
  const diceTotal = (gameState.lastDiceRoll?.[0] || 0) + (gameState.lastDiceRoll?.[1] || 0);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-lg">
      {/* Current Player Indicator */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
          style={{ backgroundColor: currentPlayer.color }}
        >
          {currentPlayer.id + 1}
        </div>
        <div>
          <h3 className="font-bold text-lg">{currentPlayer.name}&apos;s Turn</h3>
          <p className="text-sm text-gray-500">
            Position: {currentTile.name}
          </p>
        </div>
      </div>

      {/* Dice Display */}
      {gameState.lastDiceRoll && (
        <div className="mb-4 flex justify-center">
          <Dice values={gameState.lastDiceRoll} isRolling={isAnimating} />
        </div>
      )}

      {/* Phase-specific actions */}
      <div className="space-y-3">
        {/* Rolling phase */}
        {gameState.phase === 'rolling' && (
          <Button
            onClick={onRoll}
            disabled={isAnimating}
            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700"
          >
            Roll Dice
          </Button>
        )}

        {/* Jail decision */}
        {gameState.phase === 'jail-decision' && (
          <div className="space-y-2">
            <p className="text-center text-sm font-medium text-orange-600 mb-2">
              You are in Jail! Turn {currentPlayer.jailTurns + 1}/3
            </p>
            <Button
              onClick={onRoll}
              disabled={isAnimating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try to Roll Doubles
            </Button>
            <Button
              onClick={onPayJailFine}
              disabled={currentPlayer.money < 50}
              variant="outline"
              className="w-full"
            >
              Pay ₹50 Fine
            </Button>
            {currentPlayer.jailFreeCards > 0 && (
              <Button
                onClick={onUseJailCard}
                variant="outline"
                className="w-full"
              >
                Use Get Out of Jail Card
              </Button>
            )}
          </div>
        )}

        {/* Buying phase */}
        {gameState.phase === 'buying' && currentTile.property && (
          <div className="space-y-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-lg">{currentTile.name}</p>
              <p className="text-gray-600">Price: ₹{currentTile.property.price}</p>
              <p className="text-sm text-gray-500">
                Your cash: ₹{currentPlayer.money}
              </p>
            </div>
            <Button
              onClick={onBuyProperty}
              disabled={currentPlayer.money < currentTile.property.price}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Buy for ₹{currentTile.property.price}
            </Button>
            <Button
              onClick={onDeclineBuy}
              variant="outline"
              className="w-full"
            >
              Don&apos;t Buy
            </Button>
          </div>
        )}

        {/* Paying rent */}
        {gameState.phase === 'paying-rent' && (
          <div className="space-y-2">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="font-bold text-lg text-red-700">Pay Rent!</p>
              <p className="text-gray-600">{currentTile.name}</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{calculateRent(currentPlayer.position, diceTotal)}
              </p>
            </div>
            <Button
              onClick={onPayRent}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Pay Rent
            </Button>
          </div>
        )}

        {/* Card drawn */}
        {gameState.phase === 'card' && gameState.currentCard && (
          <div className="space-y-2">
            <div className={cn(
              "text-center p-4 rounded-lg",
              currentTile.type === 'chance' ? "bg-red-50" : "bg-blue-50"
            )}>
              <p className={cn(
                "font-bold text-sm mb-2",
                currentTile.type === 'chance' ? "text-red-600" : "text-blue-600"
              )}>
                {currentTile.type === 'chance' ? 'CHANCE' : 'COMMUNITY CHEST'}
              </p>
              <p className="text-gray-800">{gameState.currentCard.text}</p>
            </div>
            <Button
              onClick={onDrawCard}
              className="w-full"
            >
              OK
            </Button>
          </div>
        )}

        {/* End turn */}
        {gameState.phase === 'end-turn' && (
          <div className="space-y-2">
            {gameState.freeParkingMoney > 0 && currentPlayer.position === 20 && (
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-green-700 font-bold">
                  Collected ₹{gameState.freeParkingMoney} from Free Parking!
                </p>
              </div>
            )}
            <p className="text-center text-sm text-gray-500">
              Manage your properties or end your turn
            </p>
            <Button
              onClick={onEndTurn}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              End Turn
            </Button>
          </div>
        )}

        {/* Moving animation */}
        {gameState.phase === 'moving' && (
          <div className="text-center py-4">
            <p className="text-gray-600 animate-pulse">Moving...</p>
          </div>
        )}

        {/* Game over */}
        {gameState.phase === 'game-over' && gameState.winner !== null && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 mb-2">
              Game Over!
            </p>
            <p className="text-lg">
              {gameState.players[gameState.winner].name} Wins!
            </p>
          </div>
        )}
      </div>

      {/* Game info */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
        <p>Free Parking Pot: ₹{gameState.freeParkingMoney}</p>
        {gameState.doublesCount > 0 && (
          <p className="text-orange-600">Doubles: {gameState.doublesCount}</p>
        )}
      </div>
    </div>
  );
}
