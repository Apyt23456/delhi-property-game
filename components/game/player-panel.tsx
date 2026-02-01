'use client';

import { Player, OwnedProperty } from '@/lib/game-types';
import { TILES, GROUP_COLORS, PropertyGroup } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  ownedProperties: Record<number, OwnedProperty>;
  onBuyHouse?: (tileId: number) => void;
  onSellHouse?: (tileId: number) => void;
  onMortgage?: (tileId: number) => void;
  onUnmortgage?: (tileId: number) => void;
  canManageProperties?: boolean;
}

export function PlayerPanel({
  player,
  isCurrentPlayer,
  ownedProperties,
  onBuyHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  canManageProperties = false,
}: PlayerPanelProps) {
  const playerProperties = player.properties
    .map(id => ({
      tile: TILES[id],
      owned: ownedProperties[id],
    }))
    .sort((a, b) => {
      const groupOrder: PropertyGroup[] = [
        'brown', 'light-blue', 'pink', 'orange', 
        'red', 'yellow', 'green', 'dark-blue', 
        'railway', 'utility'
      ];
      const aGroup = a.tile.property?.group || 'utility';
      const bGroup = b.tile.property?.group || 'utility';
      return groupOrder.indexOf(aGroup) - groupOrder.indexOf(bGroup);
    });

  const totalAssets = player.money + playerProperties.reduce((sum, p) => {
    const prop = p.tile.property;
    if (!prop) return sum;
    const mortgageValue = p.owned?.mortgaged ? 0 : prop.mortgage;
    const houseValue = (p.owned?.houses || 0) * Math.floor(prop.houseCost / 2);
    return sum + mortgageValue + houseValue;
  }, 0);

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-3 sm:p-4 transition-all",
        isCurrentPlayer 
          ? "border-yellow-400 bg-yellow-50 shadow-lg" 
          : "border-gray-200 bg-white",
        player.isBankrupt && "opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
            style={{ backgroundColor: player.color }}
          >
            {player.id + 1}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">{player.name}</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">{player.token}</p>
          </div>
        </div>
        {isCurrentPlayer && (
          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold rounded-full">
            YOUR TURN
          </span>
        )}
        {player.isBankrupt && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
            BANKRUPT
          </span>
        )}
      </div>

      {/* Money */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs sm:text-sm">
        <div className="bg-green-100 rounded p-2">
          <p className="text-gray-500 text-[10px]">Cash</p>
          <p className="font-bold text-green-700">₹{player.money.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 rounded p-2">
          <p className="text-gray-500 text-[10px]">Total Assets</p>
          <p className="font-bold text-blue-700">₹{totalAssets.toLocaleString()}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-2 mb-3 text-[10px] sm:text-xs">
        <span className="px-2 py-0.5 bg-gray-100 rounded">
          Pos: {TILES[player.position]?.name || 'GO'}
        </span>
        {player.inJail && (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
            In Jail ({player.jailTurns}/3)
          </span>
        )}
        {player.jailFreeCards > 0 && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
            Jail Cards: {player.jailFreeCards}
          </span>
        )}
      </div>

      {/* Properties */}
      {playerProperties.length > 0 && (
        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2">
            Properties ({playerProperties.length})
          </p>
          <div className="space-y-1 max-h-32 sm:max-h-48 overflow-y-auto">
            {playerProperties.map(({ tile, owned }) => {
              const group = tile.property?.group;
              const color = group ? GROUP_COLORS[group] : '#888';
              const canBuyHouse = 
                canManageProperties && 
                isCurrentPlayer && 
                group !== 'railway' && 
                group !== 'utility' &&
                !owned?.mortgaged &&
                (owned?.houses || 0) < 5;
              const canSell = 
                canManageProperties && 
                isCurrentPlayer && 
                (owned?.houses || 0) > 0;
              
              return (
                <div
                  key={tile.id}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded text-[10px] sm:text-xs",
                    owned?.mortgaged ? "bg-gray-100 opacity-60" : "bg-gray-50"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 truncate font-medium">
                    {tile.name}
                  </span>
                  {owned?.houses === 5 ? (
                    <span className="text-red-600 font-bold">H</span>
                  ) : owned?.houses ? (
                    <span className="text-green-600 font-bold">{owned.houses}</span>
                  ) : null}
                  {owned?.mortgaged && (
                    <span className="text-gray-500">(M)</span>
                  )}
                  {canManageProperties && isCurrentPlayer && (
                    <div className="flex gap-0.5">
                      {canBuyHouse && onBuyHouse && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-5 px-1 text-[8px]"
                          onClick={() => onBuyHouse(tile.id)}
                        >
                          +H
                        </Button>
                      )}
                      {canSell && onSellHouse && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-5 px-1 text-[8px]"
                          onClick={() => onSellHouse(tile.id)}
                        >
                          -H
                        </Button>
                      )}
                      {!owned?.mortgaged && (owned?.houses || 0) === 0 && onMortgage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-5 px-1 text-[8px]"
                          onClick={() => onMortgage(tile.id)}
                        >
                          M
                        </Button>
                      )}
                      {owned?.mortgaged && onUnmortgage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-5 px-1 text-[8px]"
                          onClick={() => onUnmortgage(tile.id)}
                        >
                          U
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
