import { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleClick = () => {
    if (!query) return;
    onSearch(query);
  };

  return (
    <div className="w-full max-w-md mb-6">
      
      <input
        type="text"
        placeholder="Search service (e.g. Plumber)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={handleClick}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
      >
        Search Nearby
      </button>

    </div>
  );
}

export default SearchBar;