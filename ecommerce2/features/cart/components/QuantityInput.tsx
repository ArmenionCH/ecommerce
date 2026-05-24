'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export function QuantityInput({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
}: QuantityInputProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
      <button
        type="button"
        disabled={disabled || quantity <= 1}
        onClick={onDecrement}
        className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-7 text-center text-xs font-bold text-gray-800 select-none">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrement}
        className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
