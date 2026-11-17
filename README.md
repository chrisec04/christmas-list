# Chris' Christmas List

A shared Christmas list. Family pick their name, claim the gifts they're getting, and everyone else sees it right away. Chris uses Surprise View, which never loads who claimed what.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page. |
| `styles.css` | How it looks. |
| `app.js` | How it works (name picker, claiming, Surprise View). |
| `items.js` | **The list itself.** Names, price tiers and items. Edit this one most. |
| `firebase-config.js` | Connects the shared database. Until it's filled in, the site runs in test mode (claims saved only in the visitor's own browser). |
| `database.rules.json` | The rules to paste into Firebase's Realtime Database "Rules" tab. |

## Changing the list

Open `items.js` on GitHub, click the pencil icon, edit, and choose "Commit changes". The site updates in about a minute. The comments at the top of the file explain each field.

## Starting a new year

Clear the `claims` data in the Firebase console (Realtime Database, then delete the `claims` node), then update `items.js`.

## Testing on your own computer

Open `index.html` in a browser. It runs in test mode, so nothing is shared.
