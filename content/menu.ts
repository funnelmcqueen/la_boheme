/**
 * Vajana by La Bohème — menu data
 *
 * Single source of truth. Every price on the site renders from here.
 * Transcribed from the printed menu, July 2026. Verify before each season.
 *
 * Prices are integers in lekë. The `unit` field controls how they render:
 *   flat  -> "1400 L"
 *   kg    -> "9 000 L / kg"
 *   piece -> "800 L / copë"
 *   gram  -> "3 700 L / 300 gr"
 *   pair  -> "1 000 L / 2 000 L"  (uses price2)
 */

export type Unit = "flat" | "kg" | "piece" | "gram" | "pair";
export type Lang = "sq" | "en";

export interface MenuItem {
  id: string;
  name: Record<Lang, string>;
  desc?: Record<Lang, string>;
  price: number;
  price2?: number;
  unit: Unit;
  gramWeight?: number;
  /** Marks the three dishes carrying the master brand name. */
  signature?: boolean;
}

export interface MenuGroup {
  id: string;
  title: Record<Lang, string>;
  note?: Record<Lang, string>;
  /** Wine groups render as two-column name/price rows with no descriptions. */
  layout?: "dish" | "wine";
  items: MenuItem[];
}

export const ALLERGY_NOTE: Record<Lang, string> = {
  sq: "Ju lutemi informoni stafin tonë për çdo alergji ushqimore.",
  en: "Please kindly inform our staff of any food allergies.",
};

export const MENU: MenuGroup[] = [
  {
    id: "crudo",
    title: { sq: "Crudo", en: "Crudo" },
    note: { sq: "I ftohtë, i papjekur, i prerë në moment.", en: "Cold, raw, cut to order." },
    items: [
      {
        id: "carpaccio-levreku",
        name: { sq: "Carpaccio Levreku", en: "Sea Bass Carpaccio" },
        desc: {
          sq: "Finok, limon, ullinj Taggiasca, vinegret limoni, cipolinë",
          en: "Fennel, lemon, Taggiasca olives, lemon vinaigrette, cipollina onion",
        },
        price: 1400, unit: "flat",
      },
      {
        id: "tartar-levreku",
        name: { sq: "Tartar Levreku", en: "Sea Bass Tartare" },
        desc: {
          sq: "Ullinj Taggiasca, domate të thata, cipolinë",
          en: "Taggiasca olives, sun-dried tomatoes, cipollina onion",
        },
        price: 1400, unit: "flat",
      },
      {
        id: "catalana-laboheme",
        name: { sq: "Catalana në Stilin La Bohème", en: "Catalana, La Bohème Style" },
        price: 15000, unit: "kg", signature: true,
      },
      {
        id: "acuge-marinuara",
        name: { sq: "Açuge të Marinuara", en: "Marinated Anchovies" },
        desc: {
          sq: "Hudhër, majdanoz, vaj ulliri, lëkurë limoni",
          en: "Garlic, parsley, olive oil, lemon zest",
        },
        price: 900, unit: "flat",
      },
      {
        id: "tono-tartar",
        name: { sq: "Tono Tartar", en: "Tuna Tartare" },
        desc: {
          sq: "Guakamole, salcë orientale, cipolinë",
          en: "Guacamole, oriental sauce, cipollina onion",
        },
        price: 1300, unit: "flat",
      },
      {
        id: "tono-carpaccio",
        name: { sq: "Tono Carpaccio", en: "Tuna Carpaccio" },
        desc: { sq: "Salcë orientale, cipolinë", en: "Oriental sauce, cipollina onion" },
        price: 1300, unit: "flat",
      },
      {
        id: "ceviche",
        name: { sq: "Ceviche me Fruta Deti", en: "Seafood Ceviche" },
        desc: {
          sq: "Oktapod, sepje, viola, finok, qepë, vinegret",
          en: "Octopus, cuttlefish, mussels, fennel, onion, vinaigrette",
        },
        price: 1800, unit: "flat",
      },
      {
        id: "ostrika-gillardeau",
        name: { sq: "Ostrika Gillardeau", en: "Gillardeau Oyster" },
        price: 800, unit: "piece",
      },
      { id: "viola-crudo", name: { sq: "Viola", en: "Mussels" }, price: 9500, unit: "kg" },
      { id: "skampi-crudo", name: { sq: "Skampi", en: "Scampi" }, price: 9000, unit: "kg" },
      { id: "tiger-crudo", name: { sq: "Tiger", en: "Tiger Prawns" }, price: 8000, unit: "kg" },
    ],
  },

  {
    id: "selection",
    title: { sq: "Përzgjedhja Jonë", en: "Our Selection" },
    note: {
      sq: "Pjatat që dalin më shpesh nga kuzhina.",
      en: "The dishes that leave the kitchen most.",
    },
    items: [
      {
        id: "oktapod-zgare",
        name: {
          sq: "Oktapod i Pjekur në Zgarë me Patate Vjollcë",
          en: "Grilled Octopus with Purple Potatoes",
        },
        desc: {
          sq: "Ullinj Taggiasca, domate të thata",
          en: "Taggiasca olives, sun-dried tomatoes",
        },
        price: 1400, unit: "flat",
      },
      {
        id: "kallamar-crispy",
        name: { sq: "Kallamar Crispy & Aioli", en: "Crispy Calamari & Aioli" },
        desc: { sq: "Hudhër, limon, majonezë", en: "Garlic, lemon, mayonnaise" },
        price: 1300, unit: "flat",
      },
      {
        id: "misto-zgare",
        name: {
          sq: "Misto Zgarë & Emulsion Mesdhetar",
          en: "Grilled Seafood Mix & Mediterranean Emulsion",
        },
        desc: {
          sq: "Sepje, kallamar, viola, speca Padrón, patate baby",
          en: "Cuttlefish, calamari, mussels, Padrón peppers, baby potatoes",
        },
        price: 2700, unit: "flat",
      },
      {
        id: "karkalec-tempura",
        name: { sq: "Karkalec Tempura", en: "Tempura Shrimp" },
        desc: {
          sq: "Majonezë pikante, limon, cipolinë",
          en: "Spicy mayonnaise, lemon, cipollina onion",
        },
        price: 1100, unit: "flat",
      },
    ],
  },

  {
    id: "pasta",
    title: { sq: "Pasta & Rizoto", en: "Pasta & Risotto" },
    note: { sq: "Servirur ngrohtë, pa nxitim.", en: "Served hot, without hurry." },
    items: [
      {
        id: "linguine-fruta-deti",
        name: { sq: "Linguine Fruta Deti", en: "Seafood Linguine" },
        desc: {
          sq: "Kallamar, sepje, karkalec, vongole, pomodori, borzilok",
          en: "Calamari, cuttlefish, shrimp, clams, tomato, basil",
        },
        price: 1200, unit: "flat",
      },
      {
        id: "spageti-stracciatella",
        name: {
          sq: "Spageti Pomodori & Stracciatella",
          en: "Spaghetti Pomodoro & Stracciatella",
        },
        price: 1050, unit: "flat",
      },
      {
        id: "pasta-tartuf",
        name: { sq: "Pasta me Tartuf të Freskët", en: "Fresh Truffle Pasta" },
        desc: { sq: "Tartuf i freskët, parmigiano", en: "Fresh truffle, parmesan" },
        price: 1500, unit: "flat",
      },
      {
        id: "cacio-e-pepe",
        name: { sq: "Cacio e Pepe", en: "Cacio e Pepe" },
        desc: { sq: "Viola ose tono", en: "Mussels or tuna" },
        price: 1300, unit: "flat",
      },
      {
        id: "rizoto-fruta-deti",
        name: { sq: "Rizoto Fruta Deti", en: "Seafood Risotto" },
        desc: {
          sq: "Kallamar, karkalec, vongole, sepje, majdanoz, pomodori",
          en: "Calamari, shrimp, clams, cuttlefish, parsley, tomato",
        },
        price: 1200, unit: "flat",
      },
      {
        id: "rizoto-kerpudha",
        name: {
          sq: "Rizoto me Kërpudha & Tartuf të Freskët",
          en: "Mushroom & Fresh Truffle Risotto",
        },
        price: 1300, unit: "flat",
      },
    ],
  },

  {
    id: "mains",
    title: { sq: "Pjata Kryesore", en: "Main Course" },
    note: { sq: "Nga zgarja, me shoqëruese.", en: "From the grill, with sides." },
    items: [
      {
        id: "fileto-salmoni",
        name: { sq: "Fileto Salmoni", en: "Salmon Fillet" },
        desc: {
          sq: "I pjekur në zgarë, shoqëruar me krem bizele dhe patate baby",
          en: "Grilled, served with pea cream and baby potatoes",
        },
        price: 1700, unit: "flat",
      },
      {
        id: "fileto-peshku",
        name: { sq: "Fileto Peshku", en: "Fish Fillet" },
        desc: {
          sq: "I pjekur në zgarë, shoqëruar me pure patatesh, asparag dhe karrota të karamelizuara",
          en: "Grilled, served with mashed potatoes, asparagus and caramelized carrots",
        },
        price: 2500, unit: "flat",
      },
      {
        id: "ribeye",
        name: { sq: "Ribeye", en: "Ribeye Steak" },
        price: 3700, unit: "gram", gramWeight: 300,
      },
    ],
  },

  {
    id: "sides",
    title: { sq: "Shoqëruese", en: "Sides" },
    items: [
      { id: "patate-baby", name: { sq: "Patate Baby", en: "Baby Potatoes" }, price: 400, unit: "flat" },
      {
        id: "karrota-karamelizuara",
        name: { sq: "Karrota Baby të Karamelizuara", en: "Caramelized Baby Carrots" },
        price: 500, unit: "flat",
      },
      {
        id: "asparag-hudhre",
        name: { sq: "Asparag në Zgarë me Salcë Hudhre", en: "Grilled Asparagus with Garlic Sauce" },
        price: 600, unit: "flat",
      },
      { id: "pure-patate", name: { sq: "Pure Patate", en: "Mashed Potatoes" }, price: 350, unit: "flat" },
    ],
  },

  {
    id: "salads",
    title: { sq: "Sallata & Supa", en: "Salads & Soups" },
    note: { sq: "Të lehta, për orët e nxehta.", en: "Light, for the hot hours." },
    items: [
      {
        id: "sallate-mesdhetare",
        name: { sq: "Sallatë Mesdhetare", en: "Mediterranean Salad" },
        desc: {
          sq: "Domate, kastravec, qepë, ullinj, krutonë, kaperi, djath i bardhë",
          en: "Tomato, cucumber, onion, olives, croutons, capers, feta",
        },
        price: 800, unit: "flat",
      },
      {
        id: "burrata",
        name: { sq: "Burrata", en: "Burrata" },
        desc: { sq: "Pomodori shumëngjyrësh, borzilok", en: "Heirloom tomatoes, basil" },
        price: 1000, unit: "flat",
      },
      {
        id: "sallate-laboheme",
        name: { sq: "Sallata La Bohème", en: "La Bohème Salad" },
        desc: {
          sq: "Mix gjethesh, avokado, salcë Bohème, salmon, bajame",
          en: "Mixed greens, avocado, Bohème sauce, salmon, almonds",
        },
        price: 1200, unit: "flat", signature: true,
      },
      { id: "supe-peshku", name: { sq: "Supë Peshku", en: "Fish Soup" }, price: 600, unit: "flat" },
      { id: "supe-perimesh", name: { sq: "Supë Perimesh", en: "Vegetable Soup" }, price: 450, unit: "flat" },
    ],
  },

  {
    id: "catch",
    title: { sq: "Peshku i Ditës", en: "The Catch" },
    note: {
      sq: "Zgjidhni nga akulli. Peshohet para jush dhe shkon në zgare.",
      en: "Choose from the ice. We weigh it in front of you and it goes on the grill.",
    },
    items: [
      { id: "dental", name: { sq: "Dental", en: "Dentex" }, price: 9000, unit: "kg" },
      { id: "koce", name: { sq: "Koce", en: "Sea Bream" }, price: 8000, unit: "kg" },
      { id: "skorfio", name: { sq: "Skorfio", en: "Scorpion Fish" }, price: 6700, unit: "kg" },
      { id: "levrek", name: { sq: "Levrek", en: "Sea Bass" }, price: 6500, unit: "kg" },
      { id: "peshkatrice", name: { sq: "Peshkatriçe", en: "Monkfish" }, price: 5500, unit: "kg" },
      { id: "rufjo", name: { sq: "Rufjo", en: "Red Snapper" }, price: 6200, unit: "kg" },
      { id: "barbun", name: { sq: "Barbun", en: "Red Mullet" }, price: 5500, unit: "kg" },
      { id: "astice", name: { sq: "Astice / Aragostë", en: "Lobster" }, price: 15000, unit: "kg" },
      { id: "gjinkalla", name: { sq: "Gjinkalla Deti", en: "Slipper Lobster" }, price: 14500, unit: "kg" },
      { id: "viola", name: { sq: "Viola", en: "Mussels" }, price: 9500, unit: "kg" },
      { id: "skampi", name: { sq: "Skampi", en: "Scampi" }, price: 9000, unit: "kg" },
      { id: "tiger", name: { sq: "Tiger", en: "Tiger Prawns" }, price: 8000, unit: "kg" },
    ],
  },

  {
    id: "wine-red",
    title: { sq: "Qilari · Të Kuqe", en: "The Cellar · Red" },
    layout: "wine",
    items: [
      { id: "gaja-barbaresco", name: { sq: "Gaja Barbaresco", en: "Gaja Barbaresco" }, price: 45000, unit: "flat" },
      { id: "luce", name: { sq: "Luce", en: "Luce" }, price: 25000, unit: "flat" },
      { id: "brunello", name: { sq: "Brunello di Montalcino", en: "Brunello di Montalcino" }, price: 12000, unit: "flat" },
      { id: "promis-gaja", name: { sq: "Promis Gaja", en: "Promis Gaja" }, price: 11000, unit: "flat" },
      { id: "amarone", name: { sq: "Amarone della Valpolicella", en: "Amarone della Valpolicella" }, price: 8000, unit: "flat" },
      { id: "lucente", name: { sq: "Lucente", en: "Lucente" }, price: 7500, unit: "flat" },
      { id: "tassinaia", name: { sq: "Tassinaia", en: "Tassinaia" }, price: 7000, unit: "flat" },
      { id: "primitivo", name: { sq: "Primitivo di Manduria", en: "Primitivo di Manduria" }, price: 6000, unit: "flat" },
      { id: "marina-cvetic-mp", name: { sq: "Marina Cvetic Montepulciano", en: "Marina Cvetic Montepulciano" }, price: 5500, unit: "flat" },
      { id: "nipozzano", name: { sq: "Nipozzano Chianti", en: "Nipozzano Chianti" }, price: 4800, unit: "flat" },
    ],
  },

  {
    id: "wine-white",
    title: { sq: "Qilari · Të Bardha", en: "The Cellar · White" },
    layout: "wine",
    items: [
      { id: "roossj-bass", name: { sq: "Roossj-Bass Langhe Gaja", en: "Roossj-Bass Langhe Gaja" }, price: 20000, unit: "flat" },
      { id: "terre-alte", name: { sq: "Terre Alte Livio Felluga", en: "Terre Alte Livio Felluga" }, price: 18000, unit: "flat" },
      { id: "philipponnat", name: { sq: "Philipponnat Champagne", en: "Philipponnat Champagne" }, price: 15000, unit: "flat" },
      { id: "royale-reserve", name: { sq: "Royale Reserve Brut", en: "Royale Reserve Brut" }, price: 15000, unit: "flat" },
      { id: "quarz", name: { sq: "Quarz Sauvignon", en: "Quarz Sauvignon" }, price: 13000, unit: "flat" },
      { id: "vistamare", name: { sq: "Vistamare Gaja", en: "Vistamare Gaja" }, price: 11500, unit: "flat" },
      { id: "bellavista-rose", name: { sq: "Bella Vista Rosé", en: "Bella Vista Rosé" }, price: 11000, unit: "flat" },
      { id: "bellavista-brut", name: { sq: "Bella Vista Brut", en: "Bella Vista Brut" }, price: 8000, unit: "flat" },
      { id: "marina-cvetic-ch", name: { sq: "Marina Cvetic Chardonnay", en: "Marina Cvetic Chardonnay" }, price: 7500, unit: "flat" },
      { id: "chablis", name: { sq: "Chablis", en: "Chablis" }, price: 6000, unit: "flat" },
      { id: "kreuth", name: { sq: "Kreuth Chardonnay", en: "Kreuth Chardonnay" }, price: 5500, unit: "flat" },
      { id: "livio-sauv", name: { sq: "Livio Felluga Sauvignon", en: "Livio Felluga Sauvignon" }, price: 5500, unit: "flat" },
      { id: "pinot-grigio-livio", name: { sq: "Pinot Grigio Livio Felluga", en: "Pinot Grigio Livio Felluga" }, price: 5500, unit: "flat" },
      { id: "donnaluce", name: { sq: "Donnaluce", en: "Donnaluce" }, price: 5500, unit: "flat" },
      { id: "blange", name: { sq: "Blange", en: "Blange" }, price: 5000, unit: "flat" },
      { id: "muller-thurgau", name: { sq: "Müller Thurgau", en: "Müller Thurgau" }, price: 4500, unit: "flat" },
      { id: "gavi", name: { sq: "Gavi", en: "Gavi" }, price: 4500, unit: "flat" },
      { id: "terlaner", name: { sq: "Terlaner", en: "Terlaner" }, price: 4200, unit: "flat" },
      { id: "alie-rose", name: { sq: "Alie Rosé", en: "Alie Rosé" }, price: 4000, unit: "flat" },
      { id: "pecorino", name: { sq: "Pecorino Masciarelli", en: "Pecorino Masciarelli" }, price: 3500, unit: "flat" },
      { id: "greco-di-tufo", name: { sq: "Greco di Tufo", en: "Greco di Tufo" }, price: 3200, unit: "flat" },
      { id: "villa-gema", name: { sq: "Villa Gema", en: "Villa Gema" }, price: 3000, unit: "flat" },
      { id: "pinot-grigio-cesari", name: { sq: "Pinot Grigio Cesari", en: "Pinot Grigio Cesari" }, price: 2400, unit: "flat" },
    ],
  },

  {
    id: "wine-half",
    title: { sq: "Qilari · Të Vogla 0,375", en: "The Cellar · Half Bottles 0.375" },
    layout: "wine",
    items: [
      { id: "h-terlaner", name: { sq: "Terlaner", en: "Terlaner" }, price: 3000, unit: "flat" },
      { id: "h-livio-sauv", name: { sq: "Livio Felluga Sauvignon", en: "Livio Felluga Sauvignon" }, price: 2800, unit: "flat" },
      { id: "h-gavi", name: { sq: "Gavi", en: "Gavi" }, price: 2200, unit: "flat" },
      { id: "h-cesari-valp", name: { sq: "Cesari Valpolicella", en: "Cesari Valpolicella" }, price: 2200, unit: "flat" },
      { id: "h-fedora", name: { sq: "Fedora", en: "Fedora" }, price: 1200, unit: "flat" },
    ],
  },

  {
    id: "desserts",
    title: { sq: "Ëmbëlsira", en: "Desserts" },
    note: { sq: "Fundi i ngadaltë i mbrëmjes.", en: "The slow end of the evening." },
    items: [
      {
        id: "torte-cokollate",
        name: {
          sq: "Tortë me Çokollatë, Akullore Vanilje dhe Krem Karameli të Kripur",
          en: "Chocolate Cake with Vanilla Ice Cream and Salted Caramel Cream",
        },
        price: 500, unit: "flat",
      },
      {
        id: "dessert-laboheme",
        name: { sq: "La Bohème", en: "La Bohème" },
        desc: {
          sq: "Interpretim modern i çokollatës, karamelit dhe frutave tropikale",
          en: "A modern interpretation of chocolate, caramel and tropical fruit",
        },
        price: 800, unit: "flat", signature: true,
      },
      { id: "pistachio-truffle", name: { sq: "Pistachio Truffle", en: "Pistachio Truffle" }, price: 650, unit: "flat" },
      {
        id: "fruta-sezoni",
        name: { sq: "Fruta Sezoni", en: "Seasonal Fruit" },
        desc: { sq: "S / L", en: "S / L" },
        price: 1000, price2: 2000, unit: "pair",
      },
    ],
  },
];

/** Renders a price. Group separator is a thin space, matching the printed menu. */
export function formatPrice(item: MenuItem, lang: Lang = "sq"): string {
  const n = (v: number) => v.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, "\u2009");
  const kg = lang === "sq" ? "kg" : "kg";
  const piece = lang === "sq" ? "copë" : "each";
  switch (item.unit) {
    case "kg":    return `${n(item.price)} L / ${kg}`;
    case "piece": return `${n(item.price)} L / ${piece}`;
    case "gram":  return `${n(item.price)} L / ${item.gramWeight} gr`;
    case "pair":  return `${n(item.price)} L / ${n(item.price2!)} L`;
    default:      return `${n(item.price)} L`;
  }
}

/** The three dishes carrying the master brand name. Rendered above the menu. */
export const SIGNATURES = MENU.flatMap((g) => g.items).filter((i) => i.signature);
