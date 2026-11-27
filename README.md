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

Two optional fields handle sales and stock: `regular: 579` (with `price` set to the sale price) shows the usual price crossed out with an "On sale" label, and `stock: 'out'` shows an "Out of stock right now" label on the tag and in the Details window. Remove either field when it no longer applies. Out-of-stock items can still be picked.

More optional fields: `retiring: true` adds a "Retiring soon" label (LEGO sets leaving the catalog). `label` is a short name for an option (like "Full Box"). `includes: ['id1', 'id2']` on a bigger option lists the smaller options it covers, so the tag and Details window mention anyone who already picked one of them, and those smaller options lock once someone picks the bigger one. `group: 'palmsize'` on every option of one product lists the other options in the Details window with buttons that switch to them.

Tags open the Details window when clicked, so there is no separate Details button. Prices are re-checked daily by a scheduled task until a week before Christmas.

## Starting a new year

Clear the `claims` data in the Firebase console (Realtime Database, then delete the `claims` node), then update `items.js`. People who used the site last year are remembered on their device, so they will see "Welcome back" first.

## Testing on your own computer

Open `index.html` in a browser. It runs in test mode, so nothing is shared.

## If a change doesn't show up on the live site

Browsers cache `styles.css`, `app.js` and `items.js`. Each is linked in `index.html` with a `?v=` marker (for example `styles.css?v=20261117b`). When you push a change to one of those files, change the marker in `index.html` too (any new value works) so everyone's browser fetches the new copy. A hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac) also works.
