// Helper: convert IG handle to URL
const ig = (handle) => `https://www.instagram.com/${handle.replace("@","")}/`;

const itinerary = [
  {
    day: "Fri 6 Feb – Arrival",
    unlockGroup: 1, // unlocked after Q1
    items: [
      {
        id: "flight-arrive",
        time: "Arrive ~23:50",
        title: "Landing in Doha ✈️",
        tags: ["Culture"],
        note: "Arrival into Doha late night. Home → shower → unwind → sleep. (Flight: BHX 14:10 → DOH 23:50, QR0034).",
        prompt: "Screenshot this moment. Doha era starts now 📸",
      }
    ]
  },
  {
    day: "Sat 7 Feb – Corniche + Old Doha Port + Art Basel",
    unlockGroup: 1,
    items: [
      {
        id: "twisted-olive",
        time: "Morning",
        title: "Breakfast — Twisted Olive",
        tags: ["Food"],
        instagram: ig("@twistedolive.qa"),
        maps: "https://maps.google.com/?q=Twisted+Olive+Doha",
        prompt: "Order something sweet + something salty. Trust me 😌",
      },
      {
        id: "corniche",
        time: "Morning",
        title: "Corniche walk",
        tags: ["Culture","Art"],
        maps: "https://maps.google.com/?q=Doha+Corniche",
        prompt: "Skyline photos. No negotiations 📸",
      },
      {
        id: "old-doha-port",
        time: "Afternoon",
        title: "Mina Port / Old Doha Port",
        tags: ["Art","Culture"],
        instagram: ig("@olddohaport"),
        maps: "https://maps.google.com/?q=Old+Doha+Port",
        prompt: "Take a photo by the colourful boxes 📸",
      },
      {
        id: "chabrat",
        time: "Lunch",
        title: "Lunch — Chabrat Al Mina",
        tags: ["Food"],
        instagram: ig("@chabrat.almina"),
        maps: "https://maps.google.com/?q=Chabrat+Al+Mina+Doha",
        prompt: "Order something local 🍽️",
      },
      {
        id: "art-basel",
        time: "Late afternoon",
        title: "Art Basel Qatar (Msheireb / M7)",
        tags: ["Art","Culture"],
        maps: "https://maps.google.com/?q=M7+Msheireb+Doha",
        prompt: "Find ONE piece you love and tell me why 🎨",
        weatherSensitive: true
      },
      {
        id: "falamanki",
        time: "Evening",
        title: "Dinner — Falamanki",
        tags: ["Food"],
        instagram: ig("@alfalamankidoha"),
        maps: "https://maps.google.com/?q=Falamanki+Doha",
        prompt: "Pick a dish for me. I’ll pick dessert 😌",
      }
    ]
  },
  {
    day: "Sun 8 Feb – Heenat Salma Farm (All day)",
    unlockGroup: 2, // unlocked after Q2
    items: [
      {
        id: "heenat",
        time: "All day",
        title: "Heenat Salma Farm",
        tags: ["Culture","Wellness"],
        instagram: ig("@heenatsalma"),
        maps: "https://maps.google.com/?q=Heenat+Salma+Farm+Qatar",
        note: "Farm experience + long lunch + slow countryside pace. Return to Doha in evening.",
        packing: ["Sunglasses", "Comfortable shoes"],
        prompt: "Take one ‘soft life’ photo. Mandatory 📸",
        weatherSensitive: true
      }
    ]
  },
  {
    day: "Mon 9 Feb – National Museum + Lunch",
    unlockGroup: 2,
    items: [
      {
        id: "nmoq",
        time: "Morning",
        title: "National Museum of Qatar",
        tags: ["Culture","Art"],
        instagram: ig("@nmoqatar"),
        maps: "https://maps.google.com/?q=National+Museum+of+Qatar",
        prompt: "Pick your favourite gallery and rate it /10 😄",
        weatherSensitive: false
      },
      {
        id: "jiwan",
        time: "Lunch",
        title: "Lunch — Jiwan (on-site)",
        tags: ["Food"],
        instagram: ig("@jiwanrestaurant"),
        maps: "https://maps.google.com/?q=Jiwan+Restaurant+Doha",
        prompt: "Order the signature dish 🍽️",
      },
      {
        id: "souq-stroll",
        time: "Afternoon",
        title: "Souq Waqif stroll / coffee",
        tags: ["Culture","Food"],
        maps: "https://maps.google.com/?q=Souq+Waqif",
        prompt: "Spice-souq photo moment 📸",
      }
    ]
  },
  {
    day: "Tue 10 Feb – Boho Social + Taco Tuesday",
    unlockGroup: 3, // unlocked after Q3
    items: [
      {
        id: "boho",
        time: "Morning",
        title: "Breakfast — Boho Social",
        tags: ["Food"],
        instagram: ig("@bohosocialdoha"),
        maps: "https://maps.google.com/?q=Boho+Social+Doha",
        prompt: "Pick the cutest table. It’s your job 😌",
      },
      {
        id: "gym",
        time: "Afternoon",
        title: "Gym session (1/3) or chill",
        tags: ["Wellness"],
        note: "Your call. No pressure — but we’ll feel good after.",
        prompt: "Post-workout smoothie? 😄",
      },
      {
        id: "bodega",
        time: "Evening",
        title: "La Bodega — Taco Tuesday",
        tags: ["Food","Party"],
        instagram: ig("@bodeganegradoha"),
        maps: "https://maps.google.com/?q=La+Bodega+Doha",
        prompt: "Taco review: 1–10 🌮",
      }
    ]
  },
  {
    day: "Wed 11 Feb – Sealine Desert Day",
    unlockGroup: 3,
    items: [
      {
        id: "sealine",
        time: "Afternoon → Evening",
        title: "Sealine Desert Safari",
        tags: ["Culture","Party"],
        note: "Dune bashing + quad biking + Inland Sea + sunset + dinner in the desert.",
        packing: ["Sunglasses", "Scarf", "Closed shoes"],
        prompt: "Desert sunset photo. No excuses 📸",
        weatherSensitive: true
      }
    ]
  },
  {
    day: "Thu 12 Feb – Beach day + Jet skis + Dinner",
    unlockGroup: 3,
    items: [
      {
        id: "beach-choice",
        time: "Daytime",
        title: "Beach day (choose vibe): Sheraton OR Waldorf West Bay",
        tags: ["Beach","Wellness"],
        note: "Sheraton = beach access + jet skiing. Waldorf = loungers + pool + relaxed luxury.",
        packing: ["Swimwear", "Cover-up", "ID"],
        prompt: "Poolside photo moment 📸",
        weatherSensitive: true
      },
      {
        id: "tropicana",
        time: "Evening",
        title: "Dinner/drinks — Tropicana 360",
        tags: ["Food","Party"],
        instagram: ig("@tropicana360.doha"),
        maps: "https://maps.google.com/?q=Tropicana+360+Doha",
        prompt: "Golden hour drink choice? 🍹",
      },
      {
        id: "amaru",
        time: "Alt dinner",
        title: "Dinner option — Amaru",
        tags: ["Food"],
        instagram: ig("@amaru.doha"),
        maps: "https://maps.google.com/?q=Amaru+Doha",
        prompt: "Pick a starter for the table 🍽️",
      }
    ]
  },
  {
    day: "Fri 13 Feb – Brunch → CLAW → Nap → Night out",
    unlockGroup: 3,
    items: [
      {
        id: "pilates",
        time: "08:00",
        title: "Pilates (locked in)",
        tags: ["Wellness"],
        prompt: "Stretch + survive 😭",
      },
      {
        id: "brunch",
        time: "Midday",
        title: "Friday bottomless brunch (choose one)",
        tags: ["Food","Party"],
        note: "Options: STK / Provok / Novikov / Beefbar Lusail",
        instagram: ig("@stkdoha"),
        maps: "https://maps.google.com/?q=STK+Doha",
        prompt: "Brunch fit check 📸",
      },
      {
        id: "claw",
        time: "Afternoon",
        title: "CLAW — Liquid Brunch",
        tags: ["Party","Food"],
        instagram: ig("@clawbbqdoha"),
        maps: "https://maps.google.com/?q=CLAW+BBQ+Doha",
        prompt: "Find the best song of the day 🎶",
      },
      {
        id: "barn",
        time: "Night",
        title: "The Barn",
        tags: ["Party"],
        instagram: ig("@thebarndoha"),
        maps: "https://maps.google.com/?q=The+Barn+Doha",
        prompt: "One cute photo together. Non-negotiable 📸",
      }
    ]
  },

  // Valentines: always locked/blurred regardless of unlock group
  {
    day: "Sat 14 Feb – Valentine’s Day",
    alwaysHidden: true,
    items: [
      {
        id: "valentines",
        time: "All day",
        title: "This day is under wraps… 👀",
        tags: ["Wellness","Beach","Food","Party"],
        note: "Revealed closer to the time.",
        prompt: "You’ll see 😌",
      }
    ]
  },

  {
    day: "Sun 15 Feb – MIA + Lunch + Msheireb",
    unlockGroup: 3,
    items: [
      {
        id: "mia",
        time: "Morning",
        title: "Museum of Islamic Art",
        tags: ["Culture","Art"],
        instagram: ig("@miaqatar"),
        maps: "https://maps.google.com/?q=Museum+of+Islamic+Art+Doha",
        prompt: "Pick a favourite exhibit — explain it to me like I’m 5 😄",
        weatherSensitive: false
      },
      {
        id: "idam",
        time: "Lunch",
        title: "IDAM by Alain Ducasse",
        tags: ["Food"],
        instagram: ig("@idambyalainducasse"),
        maps: "https://maps.google.com/?q=IDAM+Doha",
        prompt: "Order the fanciest thing and judge it honestly 🍽️",
      },
      {
        id: "msheireb",
        time: "Afternoon",
        title: "Msheireb Downtown stroll",
        tags: ["Culture","Art"],
        maps: "https://maps.google.com/?q=Msheireb+Downtown+Doha",
        prompt: "Take a photo in the cleanest street you see 📸",
        weatherSensitive: true
      }
    ]
  },
  {
    day: "Mon 16 Feb – Departure",
    unlockGroup: 3,
    items: [
      {
        id: "flight-depart",
        time: "Depart 08:20",
        title: "Airport ✈️",
        tags: ["Culture"],
        note: "Departure DOH 08:20 → BHX 12:40 (QR0033). Easy breakfast → pack → airport.",
        prompt: "Last Doha selfie before check-in 📸",
      }
    ]
  }
];
