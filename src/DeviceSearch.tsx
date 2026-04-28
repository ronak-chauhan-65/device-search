import React, { useEffect, useRef, useState } from "react";

// Device type (normalized to match our UI instead of API shape)
type Device = {
  id: string;
  serial: string;
  status: string;
};

export default function DeviceSearch() {
  // Stores current input value
  const [query, setQuery] = useState("");

  // Stores API results
  const [results, setResults] = useState<Device[]>([]);

  // Loading state for UX feedback
  const [loading, setLoading] = useState(false);

  // Error state to show failure message
  const [error, setError] = useState<string | null>(null);

  // Tracks which item is active for keyboard navigation
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Debounce timer reference (prevents API calls on every keystroke)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AbortController reference to cancel previous API calls
  const abortRef = useRef<AbortController | null>(null);

  // Keeps track of latest query to prevent stale response overwrite
  const latestQueryRef = useRef("");

  // Cache to store previous results (improves performance)
  const cacheRef = useRef<Map<string, Device[]>>(new Map());

  // Effect runs whenever query changes
  useEffect(() => {
    // Do not call API if input is empty
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer (wait before firing API)
    debounceRef.current = setTimeout(() => {
      fetchDevices(query);
    }, 1000); // 1 second debounce

    // Cleanup debounce on re-run/unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Function to fetch devices from API
  const fetchDevices = async (q: string) => {
    // If data exists in cache, use it instead of calling API
    if (cacheRef.current.has(q)) {
      setResults(cacheRef.current.get(q)!);
      return;
    }

    // Abort previous request if still running
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Create new AbortController for current request
    const controller = new AbortController();
    abortRef.current = controller;

    // Track current query (used to avoid race condition)
    latestQueryRef.current = q;

    // Set UI states
    setLoading(true);
    setError(null);

    try {
      // API call to DummyJSON search endpoint
      const res = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`,
        { signal: controller.signal },
      );

      // Handle non-200 responses
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      // Prevent stale response overriding latest results
      if (latestQueryRef.current !== q) return;

      // Transform API data → our Device format
      const mappedResults: Device[] = (data.products || []).map((p: any) => ({
        id: String(p.id),
        serial: p.title, // using title as serial
        status: p.category, // using category as status
      }));

      // Update state
      setResults(mappedResults);

      // Save to cache
      cacheRef.current.set(q, mappedResults);
    } catch (err: any) {
      // Ignore abort errors (expected behavior)
      if (err.name === "AbortError") return;

      // Set error UI
      setError("Something went wrong. Please try again.");
      setResults([]);
    } finally {
      // Only stop loading if this is latest request
      if (latestQueryRef.current === q) {
        setLoading(false);
      }
    }
  };

  // Retry handler for error state
  const handleRetry = () => {
    if (query) fetchDevices(query);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      // Move selection down
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      // Move selection up
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      // Select item
      alert(`Selected: ${results[activeIndex].serial}`);
    }
  };

  return (
    <div className="device-search">
      {/* Accessible label for screen readers */}
      <label htmlFor="device-search">Search Device</label>

      {/* Input field */}
      <input
        id="device-search"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1); // reset selection on new input
        }}
        placeholder="Search here"
        onKeyDown={handleKeyDown}
        aria-describedby="results-info"
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
      />

      {/* Live region for accessibility updates */}
      <div id="results-info" aria-live="polite" className="info">
        {loading && <p className="loading">Loading...</p>}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={handleRetry}>Retry</button>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <p>No devices found</p>
        )}
      </div>

      {/* Results list */}
      <ul role="listbox">
        {results.map((device, index) => (
          <li
            key={device.id}
            id={`option-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className={index === activeIndex ? "active" : ""}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => alert(`Selected: ${device.serial}`)}
          >
            {device.serial} — {device.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
