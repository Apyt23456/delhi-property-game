'use client';

import { Tile, GROUP_COLORS, PropertyGroup } from '@/lib/game-data';
import { Player, OwnedProperty } from '@/lib/game-types';
import { cn } from '@/lib/utils';

interface BoardTileProps {
  tile: Tile;
  position: 'bottom' | 'left' | 'top' | 'right' | 'corner';
  players: Player[];
  owned?: OwnedProperty;
  ownerColor?: string;
}

export function BoardTile({ tile, position, players, owned, ownerColor }: BoardTileProps) {
  const playersOnTile = players.filter(p => p.position === tile.id && !p.isBankrupt);
  const isCorner = position === 'corner';
  
  const getColorBand = () => {
    if (!tile.property?.group) return null;
    const group = tile.property.group;
    if (group === 'railway' || group === 'utility') return null;
    return GROUP_COLORS[group as PropertyGroup];
  };

  const colorBand = getColorBand();

  // Property tile with color band (for bottom/top rows)
  const renderPropertyTile = () => {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Color band at top for bottom row tiles */}
        {colorBand && (
          <div 
            className="w-full h-4 sm:h-5 md:h-6 flex-shrink-0 flex items-center justify-center gap-0.5"
            style={{ backgroundColor: colorBand }}
          >
            {owned && owned.houses > 0 && (
              <>
                {owned.houses === 5 ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-700 rounded-sm border border-red-900" title="Hotel" />
                ) : (
                  Array.from({ length: owned.houses }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-700 rounded-sm border border-green-900" 
                      title="House" 
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
        {/* Property info */}
        <div className="flex-1 flex flex-col items-center justify-center p-0.5 min-h-0">
          <span className="font-bold text-center leading-tight text-[6px] sm:text-[8px] md:text-[9px] text-gray-800">
            {tile.name}
          </span>
          <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-700 mt-0.5">
            ₹{tile.property?.price}
          </span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (tile.type) {
      case 'go':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1 bg-gradient-to-br from-red-50 to-white">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-red-600">COLLECT</span>
            <span className="text-[9px] sm:text-sm md:text-base font-bold text-red-600">₹200</span>
            <span className="text-base sm:text-xl md:text-2xl font-black text-red-600 rotate-45">GO</span>
            <span className="text-[5px] sm:text-[7px] md:text-[8px] text-center text-gray-600">AS YOU PASS</span>
          </div>
        );
        
      case 'jail':
        return (
          <div className="flex flex-col items-center justify-center h-full relative bg-gradient-to-br from-orange-50 to-white">
            <div className="absolute top-0.5 left-0.5 text-[5px] sm:text-[7px] md:text-[8px] font-bold -rotate-45 text-gray-600">
              JUST<br/>VISITING
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-black bg-orange-500 flex items-center justify-center">
              <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-white">JAIL</span>
            </div>
          </div>
        );
        
      case 'free-parking':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1 bg-gradient-to-br from-green-50 to-white">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800">FREE</span>
            <div className="text-lg sm:text-2xl md:text-3xl text-green-600 font-bold">P</div>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800">PARKING</span>
          </div>
        );
        
      case 'go-to-jail':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1 bg-gradient-to-br from-gray-100 to-white">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800">GO TO</span>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-orange-600">JAIL</div>
            <span className="text-[5px] sm:text-[7px] md:text-[8px] text-center text-gray-600">DO NOT PASS GO</span>
          </div>
        );
        
      case 'income-tax':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800">INCOME</span>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-700">TAX</div>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-red-600">PAY ₹200</span>
          </div>
        );
        
      case 'luxury-tax':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800">LUXURY</span>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-700">TAX</div>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-red-600">PAY ₹100</span>
          </div>
        );
        
      case 'chance':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1 bg-gradient-to-br from-red-50 to-white">
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-red-600">CHANCE</span>
            <div className="text-lg sm:text-2xl md:text-3xl text-red-600 font-bold">?</div>
          </div>
        );
        
      case 'community-chest':
        return (
          <div className="flex flex-col items-center justify-center h-full p-1 bg-gradient-to-br from-blue-50 to-white">
            <span className="text-[5px] sm:text-[7px] md:text-[8px] font-bold text-blue-600 text-center leading-tight">
              COMMUNITY<br/>CHEST
            </span>
            <div className="text-base sm:text-xl md:text-2xl text-blue-600 mt-0.5">📦</div>
          </div>
        );
        
      case 'railway':
        return (
          <div className="flex flex-col items-center justify-center h-full p-0.5 bg-gradient-to-br from-gray-100 to-white">
            <div className="text-base sm:text-xl md:text-2xl">🚂</div>
            <span className="font-bold text-center leading-tight text-[5px] sm:text-[7px] md:text-[8px] text-gray-800">
              {tile.name}
            </span>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-700">₹{tile.property?.price}</span>
          </div>
        );
        
      case 'utility':
        return (
          <div className="flex flex-col items-center justify-center h-full p-0.5 bg-gradient-to-br from-gray-100 to-white">
            <div className="text-base sm:text-xl md:text-2xl">
              {tile.name.includes('Jal') ? '💧' : '⚡'}
            </div>
            <span className="font-bold text-center leading-tight text-[5px] sm:text-[7px] md:text-[8px] text-gray-800">
              {tile.name}
            </span>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-700">₹{tile.property?.price}</span>
          </div>
        );
        
      case 'property':
        return renderPropertyTile();
        
      default:
        return <span className="text-[6px] sm:text-[8px]">{tile.name}</span>;
    }
  };

  // Size classes based on position
  // Mobile: corner 56px, side tile 36x56px
  // SM: corner 64px, side tile 40x64px  
  // MD: corner 72px, side tile 44x72px
  const sizeClasses = cn(
    "relative border border-gray-800 bg-green-50 overflow-hidden flex-shrink-0",
    isCorner && "w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]",
    position === 'bottom' && !isCorner && "w-9 h-14 sm:w-10 sm:h-16 md:w-11 md:h-[72px]",
    position === 'top' && !isCorner && "w-9 h-14 sm:w-10 sm:h-16 md:w-11 md:h-[72px]",
    position === 'left' && !isCorner && "w-14 h-9 sm:w-16 sm:h-10 md:w-[72px] md:h-11",
    position === 'right' && !isCorner && "w-14 h-9 sm:w-16 sm:h-10 md:w-[72px] md:h-11",
    owned?.mortgaged && "opacity-50"
  );

  return (
    <div className={sizeClasses}>
      {/* Owner indicator */}
      {ownerColor && (
        <div 
          className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-bl-full z-10 border-l border-b border-gray-400"
          style={{ backgroundColor: ownerColor }}
        />
      )}
      
      {/* Content wrapper with rotation for side tiles */}
      <div className={cn(
        "w-full h-full flex items-center justify-center",
        position === 'left' && !isCorner && "rotate-90",
        position === 'right' && !isCorner && "-rotate-90",
        position === 'top' && !isCorner && "rotate-180"
      )}>
        <div className={cn(
          position !== 'left' && position !== 'right' && "w-full h-full",
          // For rotated tiles, we need to swap the dimensions
          (position === 'left' || position === 'right') && !isCorner && "w-14 h-9 sm:w-16 sm:h-10 md:w-[72px] md:h-11"
        )}>
          {renderContent()}
        </div>
      </div>
      
      {/* Player tokens */}
      {playersOnTile.length > 0 && (
        <div className="absolute bottom-0.5 left-0.5 flex flex-wrap gap-0.5 z-20 max-w-[calc(100%-4px)]">
          {playersOnTile.map(player => (
            <div
              key={player.id}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[6px] sm:text-[8px] text-white font-bold"
              style={{ backgroundColor: player.color }}
              title={player.name}
            >
              {player.id + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
