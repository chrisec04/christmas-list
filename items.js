/*
  THE LIST: edit this file to change who is on the list, the price tiers, and the items.

  - To add an item, copy one line, paste it below, and change the details.
  - "tier" must match one of the tier ids below: affordable, manageable, high, expensive.
  - "price": use a number like 26.99, or null for "Any amount".
  - "shared: true" means several people can give it (like gift cards), so there is no claim button.
  - "hidden: true" keeps an item in this file but off the page. Remove that part to bring it back.
  - Keep every item "id" unique and never change an id after people have claimed it.
*/

window.OWNER = 'Chris';

window.SHOPPERS = ['Tina', 'Sandy', 'Liz', 'Robert', 'Fred', 'Maya', 'Michael'];

window.TIERS = [
  { id: 'affordable', name: 'Affordable',  range: 'Under $35' },
  { id: 'manageable', name: 'Manageable',  range: '$35 to $90' },
  { id: 'high',       name: 'High priced', range: '$90 to $250' },
  { id: 'expensive',  name: 'Expensive',   range: 'Over $250' }
];

window.PRICE_NOTE = 'Prices are full retail from the last time they were checked and may be lower on sale.';

window.ITEMS = [
  // ---- Affordable ----
  { id: 'gift-cards', name: 'Gift cards (PlayStation, Amazon, Lego, and more)', price: null, tier: 'affordable', url: null, shared: true },
  { id: 'chef-nessie', name: 'Chef Nessie keychain plush', price: 24.95, tier: 'affordable', url: 'https://playapexshop.com/p/7541387624639' },
  { id: 'cosmic-nessie', name: 'Cosmic Nessie keychain plush', price: 24.95, tier: 'affordable', url: 'https://playapexshop.com/p/7968833437887' },
  { id: 'lego-mustang-dark-horse', name: 'LEGO Speed Champions Ford Mustang Dark Horse', price: 26.99, tier: 'affordable', url: 'https://www.lego.com/en-us/product/ford-mustang-dark-horse-sports-car-76920' },
  { id: 'gamer-nessie', name: 'Gamer Nessie plush', price: 32.95, tier: 'affordable', url: 'https://playapexshop.com/p/7880457912511' },
  { id: 'diamond-nessie', name: 'Diamond Nessie plush', price: 32.95, tier: 'affordable', url: 'https://playapexshop.com/p/8051150618815' },
  { id: 'gold-nessie', name: 'Gold Nessie plush', price: 32.95, tier: 'affordable', url: 'https://playapexshop.com/p/7628230557887' },

  // ---- Manageable ----
  { id: 'artemis-plush', name: 'Artemis plush', price: 44.95, tier: 'manageable', url: null, note: 'Link needs to be added.' },
  { id: 'lego-miles-morales-mask', name: 'LEGO Miles Morales Spider-Man mask', price: 69.99, tier: 'manageable', url: 'https://www.lego.com/en-us/product/miles-morales-mask-76329' },
  { id: 'keychron-m5', name: 'Keychron M5 wireless mouse (white)', price: 69.99, tier: 'manageable', url: 'https://www.keychron.com/products/keychron-m5-wireless-ergonomic-mouse?variant=42257163452505' },
  { id: 'lego-mini-falcon', name: 'LEGO Millennium Falcon (mini)', price: 84.99, tier: 'manageable', url: 'https://www.lego.com/en-us/product/millennium-falcon-75375' },

  // ---- High priced ----
  { id: 'plasma-cutter-replica', name: 'Plasma cutter replica (Etsy)', price: 178.98, tier: 'high', url: 'https://www.etsy.com/listing/4352093445/plasma-cutter-prop-with-lasers-dead-prop' },
  { id: 'lego-countach', name: 'LEGO Lamborghini Countach 5000 Quattrovalvole', price: 179.99, tier: 'high', url: 'https://www.lego.com/en-us/product/lamborghini-countach-5000-quattrovalvole-10337' },
  { id: 'lego-milky-way', name: 'LEGO The Milky Way Galaxy', price: 199.99, tier: 'high', url: 'https://www.lego.com/en-us/product/the-milky-way-galaxy-31212' },
  { id: 'lego-at-st', name: 'LEGO AT-ST Walker', price: 199.99, tier: 'high', url: 'https://www.lego.com/en-us/product/at-st-walker-75417' },
  { id: 'lego-tie-interceptor', name: 'LEGO TIE Interceptor', price: 229.99, tier: 'high', url: 'https://www.lego.com/en-us/product/tie-interceptor-75382' },
  { id: 'hyperice-hip', name: 'Hyperice Normatec hip attachments', price: 250, tier: 'high', url: 'https://hyperice.com/products/hip-attachment/' },

  // ---- Expensive ----
  { id: 'shure-mv7-plus', name: 'Shure MV7+ dynamic microphone', price: 299, tier: 'expensive', url: 'https://www.amazon.com/dp/B0CTJ7PVN1/' },
  { id: 'hyperice-arm', name: 'Hyperice Normatec arm attachment', price: 400, tier: 'expensive', url: 'https://hyperice.com/products/arm-attachment/' },
  { id: 'steam-deck-oled', name: 'Steam Deck OLED (512 GB)', price: 549, tier: 'expensive', url: 'https://store.steampowered.com/steamdeck' },
  { id: 'bambu-a1', name: 'Bambu Lab A1 3D printer', price: 559, tier: 'expensive', url: 'https://us.store.bambulab.com/products/a1' },
  { id: 'ruark-mr1', name: 'Ruark Audio MR1 Mk2 speakers', price: 599, tier: 'expensive', url: 'https://www.ruarkaudio.com/us/products/mr1-desktop-speaker-system' },
  { id: 'arctis-nova-elite', name: 'SteelSeries Arctis Nova Elite (Sage Gold)', price: 599.99, tier: 'expensive', url: 'https://steelseries.com/gaming-headsets/arctis-nova-elite' },
  { id: 'lego-ucs-venator', name: 'LEGO UCS Venator-Class Republic Attack Cruiser', price: 649.99, tier: 'expensive', url: 'https://www.lego.com/en-us/product/venator-class-republic-attack-cruiser-75367' },
  { id: 'lego-death-star', name: 'LEGO Death Star', price: 999.99, tier: 'expensive', url: 'https://www.lego.com/en-us/product/death-star-75419' },

  // ---- Hidden: these were marked taken on last year's list, so they are probably already received.
  // Remove "hidden: true" from any of these to put it back on the list.
  { id: 'lego-porsche-911-gt3-rs', name: 'LEGO Speed Champions Porsche 911 GT3 RS', price: 26.99, tier: 'affordable', url: 'https://www.lego.com/en-us/product/porsche-911-gt3-rs-super-car-77239', hidden: true },
  { id: 'lego-honda-s2000', name: 'LEGO Speed Champions 2 Fast 2 Furious Honda S2000', price: 26.99, tier: 'affordable', url: 'https://www.lego.com/en-us/product/2-fast-2-furious-honda-s2000-77241', hidden: true },
  { id: 'belva-nessie', name: 'Belva Nessie plush', price: 32.95, tier: 'affordable', url: 'https://playapexshop.com/p/8105783787711', hidden: true },
  { id: 'lego-droideka', name: 'LEGO Droideka', price: 64.99, tier: 'manageable', url: 'https://www.lego.com/en-us/product/droideka-75381', hidden: true },
  { id: 'ps5-disc-drive', name: 'Sony PS5 disc drive (slim, white)', price: 79.99, tier: 'manageable', url: 'https://www.bestbuy.com/site/sony-interactive-entertainment-disc-drive-for-ps5-digital-edition-consoles-model-group-slim-white/6565695.p?skuId=6565695', hidden: true },
  { id: 'stream-deck-neo', name: 'Elgato Stream Deck Neo', price: 99.99, tier: 'high', url: 'https://www.amazon.com/dp/B0CVY4566H/', hidden: true },
  { id: 'sony-inzone-e9', name: 'Sony INZONE E9 in-ear monitors', price: 149.99, tier: 'high', url: 'https://electronics.sony.com/audio/gaming-audio/inzone-headsets/p/ierg900w', hidden: true },
  { id: 'dremel-8250', name: 'Dremel 8250-5 set', price: 149.99, tier: 'high', url: 'https://www.amazon.com/dp/B09RKV6RQW/', hidden: true },
  { id: 'switch-2-bundle', name: 'Nintendo Switch 2 bundle (Costco)', price: 524.99, tier: 'expensive', url: 'https://www.costco.com/p/-/nintendo-switch-2-mario-kart-world-bundle/4000369992', hidden: true }
];
