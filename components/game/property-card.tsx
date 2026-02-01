'use client';

import { Tile, GROUP_COLORS, PropertyGroup } from '@/lib/game-data';
import { OwnedProperty } from '@/lib/game-types';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  tile: Tile;
  owned?: OwnedProperty;
  ownerName?: string;
  ownerColor?: string;
}

export function PropertyCard({ tile, owned, ownerName, ownerColor }: PropertyCardProps) {
  if (!tile.property) return null;

  const property = tile.property;
  const group = property.group;
  const color = GROUP_COLORS[group];
  const isRailway = group === 'railway';
  const isUtility = group === 'utility';

  return (
    <div className="w-48 bg-white rounded-lg border-2 border-gray-300 shadow-lg overflow-hidden">
      {/* Color band */}
      {!isRailway && !isUtility && (
        <div
          className="h-8 flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="text-white font-bold text-sm drop-shadow">
            {tile.name}
          </span>
        </div>
      )}

      {/* Title for railway/utility */}
      {(isRailway || isUtility) && (
        <div className="h-12 flex items-center justify-center bg-gray-100 border-b">
          <span className="text-2xl mr-2">{isRailway ? '🚂' : (tile.name.includes('Jal') ? '💧' : '⚡')}</span>
          <span className="font-bold text-sm">{tile.name}</span>
        </div>
      )}

      <div className="p-3 text-xs">
        {/* Regular property rent */}
        {!isRailway && !isUtility && (
          <>
            <div className="flex justify-between border-b pb-1 mb-1">
              <span>Rent</span>
              <span className="font-bold">₹{property.rent[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>With 1 House</span>
              <span>₹{property.rent[1]}</span>
            </div>
            <div className="flex justify-between">
              <span>With 2 Houses</span>
              <span>₹{property.rent[2]}</span>
            </div>
            <div className="flex justify-between">
              <span>With 3 Houses</span>
              <span>₹{property.rent[3]}</span>
            </div>
            <div className="flex justify-between">
              <span>With 4 Houses</span>
              <span>₹{property.rent[4]}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span>With Hotel</span>
              <span className="font-bold">₹{property.rent[5]}</span>
            </div>
            <div className="mt-2 pt-2 border-t text-center">
              <p>House cost: ₹{property.houseCost}</p>
              <p>Hotel cost: ₹{property.houseCost} + 4 houses</p>
            </div>
          </>
        )}

        {/* Railway rent */}
        {isRailway && (
          <>
            <div className="flex justify-between">
              <span>1 Railway owned</span>
              <span>₹25</span>
            </div>
            <div className="flex justify-between">
              <span>2 Railways owned</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between">
              <span>3 Railways owned</span>
              <span>₹100</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>4 Railways owned</span>
              <span>₹200</span>
            </div>
          </>
        )}

        {/* Utility rent */}
        {isUtility && (
          <>
            <p className="text-center mb-2">
              If one Utility is owned, rent is <strong>4x</strong> the dice roll.
            </p>
            <p className="text-center">
              If both Utilities are owned, rent is <strong>10x</strong> the dice roll.
            </p>
          </>
        )}

        {/* Mortgage value */}
        <div className="mt-2 pt-2 border-t text-center">
          <p>Mortgage Value: ₹{property.mortgage}</p>
        </div>

        {/* Owner info */}
        {owned && ownerName && (
          <div className={cn(
            "mt-2 pt-2 border-t flex items-center justify-center gap-2",
            owned.mortgaged && "opacity-60"
          )}>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: ownerColor }}
            />
            <span className="font-medium">{ownerName}</span>
            {owned.mortgaged && <span className="text-red-500">(Mortgaged)</span>}
          </div>
        )}
      </div>
    </div>
  );
}
