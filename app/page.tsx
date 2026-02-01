'use client';

import { useState } from 'react';
import { GameSetup } from '@/components/game/game-setup';
import { DelhiMonopoly } from '@/components/game/delhi-monopoly';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [gameKey, setGameKey] = useState(0);

  const handleStartGame = (count: number) => {
    setPlayerCount(count);
    setGameKey(prev => prev + 1);
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return <DelhiMonopoly key={gameKey} playerCount={playerCount} />;
}
