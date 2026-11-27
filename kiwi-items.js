/* Kiwi's Christmas List. Same fields as items.js, but there are no price tiers (leave out "tier").
   Give every item an id that starts with "kiwi-" so its claim never mixes with Chris' list.
   Optional: price, regular (usual price while on sale), stock: 'out', blurb, links, image, hidden: true. */
window.KIWI_ITEMS = [
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
