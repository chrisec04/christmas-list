/*
  THE LIST: edit this file to change who is on the list, the price tiers, the passcodes, and the items.

  - To add an item, copy one block, paste it below, and change the details.
  - "tier" must match one of the tier ids below: affordable, manageable, high, expensive.
  - "price": use a number like 26.99, or null for "Any amount".
  - "blurb": one or two short sentences shown in the Details window.
  - "links": where to buy it. Add as many as you like; each shows as a button in the Details window.
  - "image": a link to a photo, or a file you add to the images folder such as 'images/death-star.jpg'. Leave '' for a placeholder.
  - "shared: true" means several people can give it (like gift cards), so there is no claim button.
  - "hidden: true" keeps an item in this file but off the page. Remove that part to bring it back.
  - Keep every item "id" unique and never change an id after people have claimed it.
*/

window.OWNER = 'Chris';

window.SHOPPERS = ['Tina', 'Sandy', 'Liz', 'Robert', 'Fred', 'Maya', 'Michael'];

/* Passcodes (capital letters do not matter). This is a soft gate only, because the page is public.
   PASSCODE lets family in. OWNER_PASSCODE opens Chris's Surprise View, where claims are never loaded. */
window.PASSCODE = 'merry';
window.OWNER_PASSCODE = 'gifts';

window.TIERS = [
  { id: 'affordable', name: 'Stocking Stuffers', short: '<$35',     range: 'Under $35' },
  { id: 'manageable', name: 'Small Treats',      short: '$35–90',    range: '$35 to $90' },
  { id: 'high',       name: 'Big Wishes',        short: '$90–250',   range: '$90 to $250' },
  { id: 'expensive',  name: 'Grand Gifts',       short: '$250+',     range: 'Over $250' }
];

window.PRICE_NOTE = 'Prices are full retail from the last time they were checked and may be lower on sale.';

window.ITEMS = [
  // ---- Stocking Stuffers ----
  {
    id: 'gift-cards', name: 'Gift cards (PlayStation, Amazon, Lego, and more)', price: null, tier: 'affordable', shared: true,
    blurb: 'Always welcome. A card for PlayStation, Amazon, LEGO, or anywhere else works, in any amount.',
    links: [{ label: 'Amazon', url: 'https://www.amazon.com/gift-cards' }, { label: 'PlayStation', url: 'https://www.playstation.com/en-us/gift-cards/' }, { label: 'LEGO.com', url: 'https://www.lego.com/en-us/page/gift-cards' }],
    image: ''
  },
  {
    id: 'chef-nessie', name: 'Chef Nessie keychain plush', price: 24.95, tier: 'affordable',
    blurb: 'A keychain-sized plush of Nessie, the Loch Ness monster from Apex Legends, in a chef hat. It is part of the official Apex Legends cookbook collection.',
    links: [{ label: 'Play Apex shop', url: 'https://playapexshop.com/p/7541387624639' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Chef+Nessie+keychain+plush' }],
    image: ''
  },
  {
    id: 'cosmic-nessie', name: 'Cosmic Nessie keychain plush', price: 24.95, tier: 'affordable',
    blurb: 'A keychain-sized Nessie plush in a cosmic space colorway, from the Apex Legends merch line.',
    links: [{ label: 'Play Apex shop', url: 'https://playapexshop.com/p/7968833437887' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Cosmic+Nessie+keychain+plush' }],
    image: ''
  },
  {
    id: 'lego-mustang-dark-horse', name: 'LEGO Speed Champions Ford Mustang Dark Horse', price: 26.99, tier: 'affordable',
    blurb: 'A small LEGO Speed Champions build of the Ford Mustang Dark Horse sports car. It is the right size for a desk shelf.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/ford-mustang-dark-horse-sports-car-76920' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+Speed+Champions+Ford+Mustang+Dark+Horse' }],
    image: ''
  },
  {
    id: 'gamer-nessie', name: 'Gamer Nessie plush', price: 32.95, tier: 'affordable',
    blurb: 'A larger plush of Nessie in the Gamer design, from the Apex Legends Nessie collection.',
    links: [{ label: 'Play Apex shop', url: 'https://playapexshop.com/p/7880457912511' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Gamer+Nessie+plush' }],
    image: ''
  },
  {
    id: 'diamond-nessie', name: 'Diamond Nessie plush', price: 32.95, tier: 'affordable',
    blurb: 'A larger Nessie plush in the Diamond design, from the Apex Legends Nessie collection.',
    links: [{ label: 'Play Apex shop', url: 'https://playapexshop.com/p/8051150618815' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Diamond+Nessie+plush' }],
    image: ''
  },
  {
    id: 'gold-nessie', name: 'Gold Nessie plush', price: 32.95, tier: 'affordable',
    blurb: 'A larger Nessie plush in the Gold design, from the Apex Legends Nessie collection.',
    links: [{ label: 'Play Apex shop', url: 'https://playapexshop.com/p/7628230557887' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Gold+Nessie+plush' }],
    image: ''
  },

  // ---- Small Treats ----
  {
    // Note to self: Link needs to be added.
    id: 'artemis-plush', name: 'Artemis plush', price: 44.95, tier: 'manageable',
    blurb: 'Details and a store link for this one are coming soon.',
    links: [],
    image: ''
  },
  {
    id: 'lego-miles-morales-mask', name: 'LEGO Miles Morales Spider-Man mask', price: 69.99, tier: 'manageable',
    blurb: 'A LEGO display model of the Miles Morales Spider-Man mask with its signature red and black design.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/miles-morales-mask-76329' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+Miles+Morales+Spider-Man+mask' }],
    image: ''
  },
  {
    id: 'keychron-m5', name: 'Keychron M5 wireless mouse (white)', price: 69.99, tier: 'manageable',
    blurb: 'An ergonomic wireless mouse from Keychron in white, shaped for comfortable all day use.',
    links: [{ label: 'Keychron', url: 'https://www.keychron.com/products/keychron-m5-wireless-ergonomic-mouse?variant=42257163452505' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Keychron+M5+wireless+mouse+%28white%29' }],
    image: ''
  },
  {
    id: 'lego-mini-falcon', name: 'LEGO Millennium Falcon (mini)', price: 84.99, tier: 'manageable',
    blurb: 'A compact LEGO Star Wars Millennium Falcon, a smaller take on the classic smuggling ship.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/millennium-falcon-75375' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+Millennium+Falcon+%28mini%29' }],
    image: ''
  },

  // ---- Big Wishes ----
  {
    id: 'plasma-cutter-replica', name: 'Plasma cutter replica (Etsy)', price: 178.98, tier: 'high',
    blurb: 'A prop replica of a plasma cutter made by an independent maker on Etsy. It is a fun display piece for a game room.',
    links: [{ label: 'Etsy', url: 'https://www.etsy.com/listing/4352093445/plasma-cutter-prop-with-lasers-dead-prop' }],
    image: ''
  },
  {
    id: 'lego-countach', name: 'LEGO Lamborghini Countach 5000 Quattrovalvole', price: 179.99, tier: 'high',
    blurb: 'A large LEGO Icons model of the Lamborghini Countach 5000 Quattrovalvole, with the sharp wedge shape of the 1980s supercar.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/lamborghini-countach-5000-quattrovalvole-10337' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+Lamborghini+Countach+5000+Quattrovalvole' }],
    image: ''
  },
  {
    id: 'lego-milky-way', name: 'LEGO The Milky Way Galaxy', price: 199.99, tier: 'high',
    blurb: 'A LEGO Art mosaic of the Milky Way that you build and hang on the wall.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/the-milky-way-galaxy-31212' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+The+Milky+Way+Galaxy' }],
    image: ''
  },
  {
    id: 'lego-at-st', name: 'LEGO AT-ST Walker', price: 199.99, tier: 'high',
    blurb: 'A detailed LEGO Star Wars build of the Imperial AT-ST walker, made for display.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/at-st-walker-75417' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+AT-ST+Walker' }],
    image: ''
  },
  {
    id: 'lego-tie-interceptor', name: 'LEGO TIE Interceptor', price: 229.99, tier: 'high',
    blurb: 'An Ultimate Collector Series LEGO model of the Imperial TIE Interceptor, built for display.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/tie-interceptor-75382' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+TIE+Interceptor' }],
    image: ''
  },
  {
    id: 'hyperice-hip', name: 'Hyperice Normatec hip attachments', price: 250, tier: 'high',
    blurb: 'Compression sleeves with two overlapping zones that cover the hips, glutes, quads, hamstrings, and lower back. A Normatec control unit is needed and is sold separately.',
    links: [{ label: 'Hyperice', url: 'https://hyperice.com/products/hip-attachment/' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Hyperice+Normatec+hip+attachments' }],
    image: ''
  },

  // ---- Grand Gifts ----
  {
    id: 'shure-mv7-plus', name: 'Shure MV7+ dynamic microphone', price: 299, tier: 'expensive',
    blurb: 'A dynamic podcast microphone from Shure that connects over USB or XLR, with a touch panel for gain and mute.',
    links: [{ label: 'Amazon', url: 'https://www.amazon.com/dp/B0CTJ7PVN1/' }],
    image: ''
  },
  {
    id: 'hyperice-arm', name: 'Hyperice Normatec arm attachment', price: 400, tier: 'expensive',
    blurb: 'Air compression sleeves for the arms and shoulders, used for recovery after a workout. A Normatec control unit is needed and is sold separately.',
    links: [{ label: 'Hyperice', url: 'https://hyperice.com/products/arm-attachment/' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Hyperice+Normatec+arm+attachment' }],
    image: ''
  },
  {
    id: 'steam-deck-oled', name: 'Steam Deck OLED (512 GB)', price: 549, tier: 'expensive',
    blurb: 'Valve\'s handheld gaming PC with an OLED screen and 512 GB of storage, so a Steam library goes anywhere.',
    links: [{ label: 'Steam', url: 'https://store.steampowered.com/steamdeck' }],
    image: ''
  },
  {
    id: 'bambu-a1', name: 'Bambu Lab A1 3D printer', price: 559, tier: 'expensive',
    blurb: 'A desktop 3D printer from Bambu Lab that is known for quick setup and automatic calibration.',
    links: [{ label: 'Bambu Lab store', url: 'https://us.store.bambulab.com/products/a1' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=Bambu+Lab+A1+3D+printer' }],
    image: ''
  },
  {
    id: 'ruark-mr1', name: 'Ruark Audio MR1 Mk2 speakers', price: 599, tier: 'expensive',
    blurb: 'Compact powered desktop speakers from Ruark Audio with Bluetooth and a rich sound for their size.',
    links: [{ label: 'Ruark Audio', url: 'https://www.ruarkaudio.com/us/products/mr1-desktop-speaker-system' }],
    image: ''
  },
  {
    id: 'arctis-nova-elite', name: 'SteelSeries Arctis Nova Elite (Sage Gold)', price: 599.99, tier: 'expensive',
    blurb: 'SteelSeries\' top of the line wireless gaming headset, shown here in the Sage Gold color.',
    links: [{ label: 'SteelSeries', url: 'https://steelseries.com/gaming-headsets/arctis-nova-elite' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=SteelSeries+Arctis+Nova+Elite+%28Sage+Gold%29' }],
    image: ''
  },
  {
    id: 'lego-ucs-venator', name: 'LEGO UCS Venator-Class Republic Attack Cruiser', price: 649.99, tier: 'expensive',
    blurb: 'A giant Ultimate Collector Series LEGO model of the Republic Attack Cruiser from Star Wars, made for display.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/venator-class-republic-attack-cruiser-75367' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+UCS+Venator-Class+Republic+Attack+Cruiser' }],
    image: ''
  },
  {
    id: 'lego-death-star', name: 'LEGO Death Star', price: 999.99, tier: 'expensive',
    blurb: 'A huge LEGO Star Wars build of the Death Star. It is the biggest set on the list.',
    links: [{ label: 'LEGO.com', url: 'https://www.lego.com/en-us/product/death-star-75419' }, { label: 'Amazon', url: 'https://www.amazon.com/s?k=LEGO+Death+Star' }],
    image: ''
  },

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
