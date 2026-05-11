"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchAutocomplete } from "@/lib/api";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ label: string; value: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await fetchAutocomplete(query);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(s: { label: string; value: string }) {
    setQuery(s.label);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(s.value)}`);
  }

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, zip code, or address..."
          className="flex-1 rounded-l-lg border-0 bg-white px-5 py-4 text-gray-900 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          className="rounded-r-lg bg-gold px-6 py-4 font-semibold text-navy shadow-lg transition hover:bg-yellow-500"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg bg-white shadow-xl">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
