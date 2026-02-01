'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PLAYER_COLORS, PLAYER_TOKENS } from '@/lib/game-data';

interface GameSetupProps {
  onStartGame: (playerCount: number) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800 tracking-wider mb-2">
            DELHI
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 tracking-widest">
            MONOPOLY
          </h2>
          <p className="text-gray-500 mt-2">
            Experience the Capital City
          </p>
        </div>

        {/* Player Count Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Players
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${playerCount === count
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl font-bold">{count}</span>
                <p className="text-xs text-gray-500 mt-1">Players</p>
              </button>
            ))}
          </div>
        </div>

        {/* Player Preview */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">Players</p>
          <div className="space-y-2">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow"
                  style={{ backgroundColor: PLAYER_COLORS[i] }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium">Player {i + 1}</p>
                  <p className="text-xs text-gray-500">{PLAYER_TOKENS[i]}</p>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                  ₹1,500
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={() => onStartGame(playerCount)}
          className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
        >
          Start Game
        </Button>

        {/* Quick Rules */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Roll dice, buy properties, collect rent, and bankrupt your opponents!</p>
        </div>
      </div>
    </div>
  );
}
