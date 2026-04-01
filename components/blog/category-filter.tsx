"use client";

import { useState } from "react";

interface CategoryFilterProps {
  categories: string[];
  onFilter: (category: string | null) => void;
}

export function CategoryFilter({ categories, onFilter }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);

  function handleClick(cat: string | null) {
    setActive(cat);
    onFilter(cat);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleClick(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          active === null
            ? "bg-brand-primary text-white shadow-md"
            : "bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        All Articles
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
            active === cat
              ? "bg-brand-primary text-white shadow-md"
              : "bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
