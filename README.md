# Chris' Christmas List

A shared Christmas list. Family enter a passcode, pick their name, and claim the gifts they're getting. Everyone else sees an item is taken right away, but never who took it. Chris has a Surprise View that never loads who claimed what.

## How people get in

1. First visit: a welcome animation, then **Enter**.
2. The ornament asks for the family passcode (currently `merry`, capital letters do not matter).
3. "Who are you?" Pick a name or type a new one. It is remembered on that device, so next time they see "Welcome back" and go straight to the list. "Not Tina?" lets someone switch.

**Chris's Surprise View:** type the owner passcode (currently `gifts`) on the ornament. It opens the list as Chris, with no claims, stamps or picks shown. The page never even asks the database for claims in this view.

The passcodes are a soft gate only. The site is public, so anyone who reads the page's code can find them. They keep casual visitors out and nothing more.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page and its screens. |
| `styles.css` | How it looks. |
| `app.js` | How it works (welcome flow, passcodes, claiming, Surprise View, Details window). |
| `items.js` | **The list itself.** Names, passcodes, price tiers and items. Edit this one most. |
| `firebase-config.js` | Connects the shared database. Until it's filled in, the site runs in test mode (claims saved only in the visitor's own browser). |
| `database.rules.json` | The rules to paste into Firebase's Realtime Database "Rules" tab. |

## Changing the list

Open `items.js` on GitHub, click the pencil icon, edit, and choose "Commit changes". The site updates in about a minute. The comments at the top of the file explain each field.

Each item has a short `blurb`, a list of `links` (one button per store in the Details window) and an optional `image`. To use your own photo, upload it into an `images` folder in the repo and set `image: 'images/death-star.jpg'`. Items without an image show a "Photo coming soon" box.

## Starting a new year

Clear the `claims` data in the Firebase console (Realtime Database, then delete the `claims` node), then update `items.js`. People who used the site last year are remembered on their device, so they will see "Welcome back" first.

## Testing on your own computer

Open `index.html` in a browser. It runs in test mode, so nothing is shared.
