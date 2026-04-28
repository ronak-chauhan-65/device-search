# Device Search Component

This project implements a **Device Search component** built with React + TypeScript.
It allows users to search for devices (by serial-like input) and fetch results from an API with proper handling of real-world scenarios like latency, failures, and race conditions.

---

## Features

- Debounced search (prevents excessive API calls)
- Request cancellation using `AbortController`
- Race condition handling (stale responses are ignored)
- Loading, error, and empty states
- Retry mechanism on API failure
- Keyboard navigation (↑ ↓ Enter)
- Basic accessibility support (ARIA roles, live region)
- In-memory caching for faster repeat searches

---

## API Used

Instead of a fake API, I used a real public API:

[https://dummyjson.com/products/search?q=](https://dummyjson.com/products/search?q=)

This helps simulate real-world behavior like:

- actual network latency
- real search results
- empty responses

---

## Data Mapping

Since the API does not return "devices", I mapped the response:

| API Field  | UI Field |
| ---------- | -------- |
| `id`       | `id`     |
| `title`    | `serial` |
| `category` | `status` |

This keeps the UI decoupled from backend structure.

---

## Example Searches

You can try the following inputs:

- `phone`
- `laptop`
- `watch`
- `shoes`

To test empty state:

- `asdasdasd123`

---

## Setup Instructions

1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open in browser

```
http://localhost:5173
```

---

## Assumptions Made

- The original API (`api.example.com`) is not real, so a public API was used instead
- “Serial number” is simulated using product titles
- “Status” is represented using product category
- API responses may be slow or fail, so error handling and retry logic are implemented
- Results are relatively small, so no pagination/virtualization is added

---

## Limitations

- No backend control (depends on public API behavior)
- No authentication or rate-limit handling
- UI is minimal (focus was on logic, not styling)

---

## Notes

- I intentionally used `fetch` instead of libraries like Axios or React Query to demonstrate:
  - request lifecycle control
  - cancellation
  - handling race conditions manually

---

## Future Improvements

- Highlight matched search text
- Add result selection callback instead of `alert`
- Add virtualization for large datasets
- Improve accessibility (aria-activedescendant, screen reader announcements)

---

## Summary

This implementation focuses on **correct async handling, UX states, and robustness**, which are critical in real-world applications.
