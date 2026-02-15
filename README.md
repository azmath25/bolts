# Grid Bolt Editor v5

Clean rewrite with simplified logic.

## Key Changes

- **Clean rebuild logic**: No complex reconnection, just filter deleted points
- **Always alternating signs**: Reassigned from scratch after every move
- **Cartesian coordinates**: (0,0) at bottom-left
- **Simple collision handling**: Find collisions → delete if sign=0 → rebuild

## Coordinates

```
(n,0) ________ (n,m)
  |              |
  |   UP ↑       |
  |              |
(0,0) ________ (0,m)
```

- UP = increase i
- DOWN = decrease i
- LEFT = decrease j
- RIGHT = increase j

## Files

- index.html - UI
- style.css - Styling
- script.js - Events
- grid.js - Rendering (with coordinate flip)
- bolt.js - **CLEAN** forest logic
- domain.js - Domain
- utils.js - Helpers

## License

MIT
