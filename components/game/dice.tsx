'use client';

import { cn } from '@/lib/utils';

interface DiceProps {
  values: [number, number];
  isRolling?: boolean;
}

const DotPattern: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function SingleDie({ value, isRolling }: { value: number; isRolling?: boolean }) {
  const dots = DotPattern[value] || [];

  return (
    <div
      className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 relative",
        isRolling && "animate-bounce"
      )}
    >
      <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className="flex items-center justify-center"
              >
                {hasDot && (
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-900 rounded-full" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function Dice({ values, isRolling }: DiceProps) {
  return (
    <div className="flex gap-3 items-center">
      <SingleDie value={values[0]} isRolling={isRolling} />
      <SingleDie value={values[1]} isRolling={isRolling} />
      <div className="text-lg sm:text-xl font-bold text-gray-700 ml-2">
        = {values[0] + values[1]}
      </div>
    </div>
  );
}
