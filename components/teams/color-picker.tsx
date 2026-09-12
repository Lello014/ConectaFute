"use client";

import { useState } from "react";

interface ColorPickerProps {
  name: string;
  defaultValue?: string;
  label: string;
}

export function ColorPicker({ name, defaultValue = "#059669", label }: ColorPickerProps) {
  const [color, setColor] = useState(defaultValue);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border border-neutral-300 dark:border-neutral-600"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-mono dark:border-neutral-600 dark:bg-neutral-800"
          maxLength={7}
        />
        <div
          className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-600"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
