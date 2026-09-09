# The Family Tree

Create a family tree in the browser. Add people and connect them. Saving a tree requires an account; signed-in users get a dashboard of saved trees and can start more.

```bash
npm install
npm run dev
```

Open [http://localhost:43217](http://localhost:43217).

- **Save tree** asks you to log in, then stores the tree on your account.
- **Trees** (after login) lists saved trees, opens them, and creates new ones.
- Drafts stay in this browser until you save.
- **Arrange** lines couples up and centers children under their parents.
- Select someone to **Delete** them, or press Delete / Backspace.
- **Undo** / **Redo** (Ctrl+Z / Ctrl+Shift+Z) reverse recent edits.

Optional: set `SESSION_SECRET` in `.env.local` for signed cookies. Without it, a local development secret is used.
