'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { GameBoard } from './game-board';
import { GameControls } from './game-controls';
import { PlayerPanel } from './player-panel';
import { Button } from '@/components/ui/button';

interface DelhiMonopolyProps {
  playerCount?: number;
}

export function DelhiMonopoly({ playerCount = 2 }: DelhiMonopolyProps) {
  const {
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
    calculateRent,
  } = useGame(playerCount);

  const [showRules, setShowRules] = useState(false);

  const canManageProperties = gameState.phase === 'end-turn';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-2 sm:p-4">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-wider">
          DELHI MONOPOLY
        </h1>
        <p className="text-emerald-200 text-sm sm:text-base">
          Experience the Capital City
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRules(!showRules)}
            className="text-xs"
          >
            {showRules ? 'Hide Rules' : 'Show Rules'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className="text-xs"
          >
            New Game
          </Button>
        </div>
      </header>

      {/* Rules Panel */}
      {showRules && (
        <div className="max-w-2xl mx-auto mb-4 bg-white/95 rounded-lg p-4 text-sm">
          <h3 className="font-bold mb-2">Game Rules:</h3>
          <ul className="space-y-1 text-gray-700">
            <li>Roll dice to move around the board clockwise.</li>
            <li>Buy unowned properties you land on.</li>
            <li>Pay rent when landing on opponents&apos; properties.</li>
            <li>Collect ₹200 every time you pass GO.</li>
            <li>Roll doubles to get out of jail, pay ₹50, or use a card.</li>
            <li>Three doubles in a row sends you to jail.</li>
            <li>Build houses/hotels when you own all properties of a color.</li>
            <li>Railway rent increases with each railway owned.</li>
            <li>Utility rent is dice roll × 4 (or ×10 with both utilities).</li>
            <li>Last player standing wins!</li>
          </ul>
        </div>
      )}

      {/* Main Game Layout */}
      <div className="flex flex-col xl:flex-row gap-4 justify-center items-start max-w-[1400px] mx-auto">
        {/* Left Panel - Players 1 & 3 */}
        <div className="w-full xl:w-64 flex xl:flex-col gap-4 order-2 xl:order-1 flex-shrink-0">
          {gameState.players.filter((_, i) => i % 2 === 0).map(player => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={gameState.currentPlayerIndex === player.id}
              ownedProperties={gameState.ownedProperties}
              onBuyHouse={handleBuyHouse}
              onSellHouse={handleSellHouse}
              onMortgage={handleMortgage}
              onUnmortgage={handleUnmortgage}
              canManageProperties={canManageProperties}
            />
          ))}
        </div>

        {/* Center - Game Board */}
        <div className="order-1 xl:order-2 overflow-x-auto">
          <div className="min-w-fit">
            <GameBoard
              players={gameState.players}
              ownedProperties={gameState.ownedProperties}
            />
          </div>
        </div>

        {/* Right Panel - Controls & Players 2 & 4 */}
        <div className="w-full xl:w-72 flex flex-col gap-4 order-3 flex-shrink-0">
          <GameControls
            gameState={gameState}
            isAnimating={isAnimating}
            onRoll={handleRoll}
            onBuyProperty={handleBuyProperty}
            onDeclineBuy={handleDeclineBuy}
            onPayRent={handlePayRent}
            onDrawCard={handleCard}
            onEndTurn={handleEndTurn}
            onPayJailFine={handlePayJailFine}
            onUseJailCard={handleUseJailCard}
            calculateRent={calculateRent}
          />
          
          {gameState.players.filter((_, i) => i % 2 === 1).map(player => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={gameState.currentPlayerIndex === player.id}
              ownedProperties={gameState.ownedProperties}
              onBuyHouse={handleBuyHouse}
              onSellHouse={handleSellHouse}
              onMortgage={handleMortgage}
              onUnmortgage={handleUnmortgage}
              canManageProperties={canManageProperties}
            />
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.phase === 'game-over' && gameState.winner !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-2xl">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: gameState.players[gameState.winner].color }}
            >
              {gameState.winner + 1}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {gameState.players[gameState.winner].name} Wins!
            </h2>
            <p className="text-gray-600 mb-6">
              Final wealth: ₹{gameState.players[gameState.winner].money.toLocaleString()}
            </p>
            <Button onClick={resetGame} className="w-full">
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
