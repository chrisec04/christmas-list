/* Kiwi's Christmas List. Same fields as items.js, but there are no price tiers (leave out "tier").
   Give every item an id that starts with "kiwi-" so its claim never mixes with Chris' list.
   Optional: price, regular (usual price while on sale), stock: 'out', blurb, links, image, hidden: true. */
window.KIWI_ITEMS = [
  {
    id: 'kiwi-chewy-egift', name: 'Chewy eGift Card', price: null, shared: true,
    blurb: 'A Chewy card covers food, treats, and toys for Kiwi. It comes in amounts from $25 to $500 and is sent by email.',
    links: [{ label: 'Chewy', url: 'https://www.chewy.com/chewy-egift-card/dp/226305' }],
    image: 'images/kiwi-chewy-egift.jpg'
  },
  {
    id: 'kiwi-purr-pops', name: 'Bonkers Purr Pops Salmon cat treats (4 pack)', price: 1.99, regular: 2.49,
    blurb: 'Freeze-dried salmon treats shaped like hearts on a stick, so Kiwi can lick and nibble. There are 4 in a pack.',
    links: [{ label: 'Chewy', url: 'https://www.chewy.com/bonkers-purr-pops-lip-smackin-grain/dp/1291014' }],
    image: 'images/kiwi-purr-pops.jpg'
  },
  {
    id: 'kiwi-silvervine-sticks', name: 'Raffia Silvervine Chew Sticks (6 pack)', price: 9.98, regular: 16.99,
    blurb: 'Natural silvervine sticks with raffia ends for Kiwi to chew and bat around. Silvervine is a popular alternative to catnip.',
    links: [{ label: 'Amazon', url: 'https://www.amazon.com/dp/B0B5K6V3X2' }],
    image: 'images/kiwi-silvervine.jpg'
  },
  {
    id: 'kiwi-churu-tub', name: 'Inaba Churu Tuna & Chicken treats (50 tubes)', price: 32.96, regular: 49.99,
    blurb: 'A tub of 50 creamy Churu puree tubes in tuna and chicken flavors, 0.5 oz each. Kiwi licks it right off the tube.',
    links: [{ label: 'Chewy', url: 'https://www.chewy.com/inaba-churu-tuna-chicken-puree/dp/184459' }],
    image: 'images/kiwi-churu.jpg'
  },
  {
    id: 'kiwi-kh-hammock', name: 'K&H Elevated Hammock Cat Bed', price: 34.98, regular: 41.99,
    blurb: 'A raised, free-standing hammock bed so Kiwi can nap up off the floor. It has a plush pad, a washable cover, and goes together without tools.',
    links: [
      { label: 'K&H Pet', url: 'https://khpet.com/collections/new-cat-products/products/k-h-pet-hammock-elevated-cot-indoor-cat-bed' },
      { label: 'Amazon', url: 'https://www.amazon.com/dp/B0GYB9QTCQ' }
    ],
    image: 'images/kiwi-kh-hammock.jpg'
  }
];
