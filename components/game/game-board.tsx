'use client';

import { TILES } from '@/lib/game-data';
import { Player, OwnedProperty } from '@/lib/game-types';
import { BoardTile } from './board-tile';

interface GameBoardProps {
  players: Player[];
  ownedProperties: Record<number, OwnedProperty>;
}

export function GameBoard({ players, ownedProperties }: GameBoardProps) {
  const getOwnerColor = (tileId: number): string | undefined => {
    const owned = ownedProperties[tileId];
    if (!owned) return undefined;
    return players.find(p => p.id === owned.ownerId)?.color;
  };

  // Bottom row: tiles 0-10 (GO at position 0 is bottom-right corner)
  // Displayed right to left: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  const bottomTiles = [
    TILES[10], // Jail - bottom-left corner
    TILES[9],
    TILES[8],
    TILES[7],
    TILES[6],
    TILES[5],
    TILES[4],
    TILES[3],
    TILES[2],
    TILES[1],
    TILES[0], // GO - bottom-right corner
  ];

  // Left column: tiles 11-19 (bottom to top, excluding corners)
  const leftTiles = [
    TILES[11],
    TILES[12],
    TILES[13],
    TILES[14],
    TILES[15],
    TILES[16],
    TILES[17],
    TILES[18],
    TILES[19],
  ];

  // Top row: tiles 20-30 (left to right)
  const topTiles = [
    TILES[20], // Free Parking - top-left corner
    TILES[21],
    TILES[22],
    TILES[23],
    TILES[24],
    TILES[25],
    TILES[26],
    TILES[27],
    TILES[28],
    TILES[29],
    TILES[30], // Go To Jail - top-right corner
  ];

  // Right column: tiles 31-39 (top to bottom, excluding corners)
  const rightTiles = [
    TILES[31],
    TILES[32],
    TILES[33],
    TILES[34],
    TILES[35],
    TILES[36],
    TILES[37],
    TILES[38],
    TILES[39],
  ];

  return (
    <div className="inline-block bg-emerald-100 border-4 border-gray-900 shadow-2xl">
      {/* Top row */}
      <div className="flex">
        {topTiles.map((tile, index) => (
          <BoardTile
            key={tile.id}
            tile={tile}
            position={index === 0 || index === 10 ? 'corner' : 'top'}
            players={players}
            owned={ownedProperties[tile.id]}
            ownerColor={getOwnerColor(tile.id)}
          />
        ))}
      </div>

      {/* Middle section */}
      <div className="flex">
        {/* Left column - height matches center */}
        <div className="flex flex-col-reverse h-[324px] sm:h-[360px] md:h-[396px]">
          {leftTiles.map((tile) => (
            <BoardTile
              key={tile.id}
              tile={tile}
              position="left"
              players={players}
              owned={ownedProperties[tile.id]}
              ownerColor={getOwnerColor(tile.id)}
            />
          ))}
        </div>

        {/* Center area - 9 side tiles wide/tall */}
        {/* Mobile: 9 * 36px = 324px, SM: 9 * 40px = 360px, MD: 9 * 44px = 396px */}
        <div className="bg-emerald-200 flex items-center justify-center w-[324px] h-[324px] sm:w-[360px] sm:h-[360px] md:w-[396px] md:h-[396px]">
          <div 
            className="text-center p-2 sm:p-4 w-full h-full flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)'
            }}
          >
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-red-700 tracking-wider drop-shadow-sm">
              DELHI
            </h1>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-widest mt-1">
              MONOPOLY
            </h2>
            <div className="mt-2 sm:mt-4 hidden sm:block">
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Property Colors</p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#8B4513' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Brown</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#87CEEB' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Lt Blue</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#FF69B4' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Pink</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#FFA500' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Orange</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#FF0000' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Red</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#FFFF00' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Yellow</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#228B22' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Green</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded" style={{ backgroundColor: '#00008B' }} />
                  <span className="text-[8px] sm:text-[10px] text-gray-600 mt-0.5">Dk Blue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - height matches center */}
        <div className="flex flex-col h-[324px] sm:h-[360px] md:h-[396px]">
          {rightTiles.map((tile) => (
            <BoardTile
              key={tile.id}
              tile={tile}
              position="right"
              players={players}
              owned={ownedProperties[tile.id]}
              ownerColor={getOwnerColor(tile.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex">
        {bottomTiles.map((tile, index) => (
          <BoardTile
            key={tile.id}
            tile={tile}
            position={index === 0 || index === 10 ? 'corner' : 'bottom'}
            players={players}
            owned={ownedProperties[tile.id]}
            ownerColor={getOwnerColor(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}
