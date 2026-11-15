import type { ContentMap } from "./schema";

/**
 * Default content. Page copy doubles as a safe fallback if the database is
 * unreachable; menu items, prices and team members are seed data only — the
 * owner replaces them from the admin dashboard.
 */

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

export const STOCK = {
  interior: u("1755884931646-ae6e1d227717"),
  bar: u("1469631423273-6995642a6a40"),
  latteArt: u("1541167760496-1628856ab772"),
  cappuccino: u("1497636577773-f1231844b336"),
  flatWhite: u("1593443320739-77f74939d0da"),
  espresso: u("1583165278997-0250ea5d72e2"),
  caramelLatte: u("1529892485617-25f63cd7b1e9"),
  heartLatte: u("1512568400610-62da28bc8a13"),
  icedLatte: u("1461023058943-07fcbe16d735"),
  coldBrew: u("1759259639356-6eee63241869"),
  matcha: u("1766426910014-63a302fa137e"),
  icedMatcha: u("1717603545758-88cc454db69b"),
  croissant: u("1555507036-ab1f4038808a"),
  pastries: u("1597528662465-55ece5734101"),
  pourOver: u("1596018589878-217d8603c4c6"),
  beans: u("1511920170033-f8396924c348"),
  team1: u("1599549192669-6baac5d32432"),
  team2: u("1517701928392-16651ac1e944"),
  team3: u("1599548713969-3460f26dc07e"),
  team4: u("1631270275227-0abd3ad56b34"),
} as const;

const img = (url: string, alt: string) => ({ url, publicId: "", alt });

export const DEFAULT_CONTENT: ContentMap = {
  home: {
    hero: {
      eyebrow: "Neighbourhood coffee house",
      heading: "Slow down.\nSip something good.",
      description:
        "Small-batch roasts, silky milk and warm pastries — poured with care in a corner made for lingering.",
      primaryCtaLabel: "Explore the menu",
      secondaryCtaLabel: "Visit us",
      badges: ["Freshly roasted", "Baked daily", "Oat & almond milk"],
    },
    ticker: ["Espresso", "Flat white", "Cold brew", "Matcha", "Pour over", "Croissants", "Cortado", "Chai"],
    brewing: {
      eyebrow: "From bean to cup",
      heading: "How your cup comes to life",
      steps: [
        { title: "The beans", description: "Hand-picked, small-batch roasted beans with notes of cocoa and caramel." },
        { title: "Freshly ground", description: "Ground moments before brewing to lock in every aroma." },
        { title: "Into the machine", description: "Dosed, levelled and tamped into the portafilter." },
        { title: "Hot water", description: "Water at just the right temperature flows through the grounds." },
        { title: "The pour", description: "Rich espresso fills the cup, topped with velvety milk." },
        { title: "A little steam", description: "Warm, fragrant and ready the moment it reaches you." },
        { title: "Your cup", description: "Made slowly. Served warmly." },
      ],
      finalHeading: "Your cup is ready.",
      finalMessage: "Pull up a chair — we saved you a seat by the window.",
    },
    featured: {
      eyebrow: "The menu",
      heading: "Something for every mood",
      description: "Classic espresso, slow-brewed coffee, matcha and pastries baked every morning.",
      ctaLabel: "See the full menu",
    },
    bestsellers: {
      eyebrow: "Crowd favourites",
      heading: "Our best sellers",
      description: "The cups our regulars come back for.",
    },
    team: {
      eyebrow: "The people",
      heading: "Meet the team behind the bar",
      description: "Friendly faces, steady hands and a lot of coffee knowledge.",
    },
    visit: {
      eyebrow: "Come say hello",
      heading: "Visit Mellow Mug",
      description: "Grab a window seat, bring a book, or take your favourite cup to go.",
    },
  },

  pages: {
    menu: {
      eyebrow: "The menu",
      heading: "Poured slowly,\nserved warmly.",
      description: "Espresso classics, silky lattes, cold brew, matcha and pastries baked every morning.",
    },
    about: {
      eyebrow: "About us",
      heading: "Our story &\nthe people behind it.",
      description: "A small neighbourhood café built on good beans, warm light and friendly faces.",
    },
    visit: {
      eyebrow: "Visit us",
      heading: "Come in,\nstay a while.",
      description: "Find us, check today's hours, or give us a call — we'd love to see you.",
    },
  },

  story: {
    eyebrow: "Our story",
    heading: "A small café with a big love for good coffee.",
    intro: "Mellow Mug started with a simple idea: a warm place where the coffee is honest and nobody rushes you.",
    body:
      "We work with small roasters, steam our milk to order and bake our pastries every morning. Whether you stay for an hour or grab a cup on the way to work, we want every visit to feel like coming back to a favourite corner of the neighbourhood.",
    quote: "Good coffee is a small daily ritual — we just try to make it a little better.",
    quoteAuthor: "The Mellow Mug team",
    images: [img(STOCK.interior, "Warm café interior with wooden tables and natural light"), img(STOCK.bar, "Espresso bar with coffee machines")],
    values: [
      { title: "Small-batch beans", description: "Roasted in small lots for freshness and flavour." },
      { title: "Made to order", description: "Every drink is made fresh, just the way you like it." },
      { title: "Baked every morning", description: "Pastries from the oven, not a box." },
    ],
  },

  contact: {
    businessName: "Mellow Mug",
    tagline: "Neighbourhood coffee, poured with care.",
    currency: "$",
    phone: "(555) 012-3456",
    email: "hello@mellowmug.com",
    address: "Skopje, North Macedonia",
    mapQuery: "Skopje, North Macedonia",
    mapEmbedUrl: "",
    hours: [
      { days: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
      { days: "Saturday", time: "8:00 AM – 8:00 PM" },
      { days: "Sunday", time: "8:00 AM – 5:00 PM" },
    ],
    hoursNote: "Kitchen closes 30 minutes before closing.",
    socials: { instagram: "", facebook: "", tiktok: "", x: "", youtube: "", google: "" },
    footerText: "Small-batch coffee, fresh pastries and a seat that's always warm.",
    footerNote: "Made with love and a lot of espresso.",
  },
};

/* seed-only data */

export const SEED_CATEGORIES = [
  { key: "espresso", name: "Espresso Bar", description: "Classic espresso drinks" },
  { key: "milk", name: "Lattes & Milk", description: "Silky, comforting and smooth" },
  { key: "cold", name: "Cold Coffee", description: "Iced and slow-steeped" },
  { key: "tea", name: "Matcha & Tea", description: "Earthy, bright and calming" },
  { key: "bakery", name: "Bakery", description: "Baked fresh every morning" },
] as const;

export const SEED_ITEMS: {
  cat: (typeof SEED_CATEGORIES)[number]["key"];
  name: string;
  description: string;
  price: number;
  image: string;
  alt: string;
  featured?: boolean;
  bestseller?: boolean;
  tags?: string[];
}[] = [
  { cat: "espresso", name: "Espresso", description: "A bold, syrupy double shot with notes of dark chocolate.", price: 3.0, image: STOCK.espresso, alt: "Espresso in a glass on an espresso machine", featured: true },
  { cat: "espresso", name: "Cappuccino", description: "Equal parts espresso, steamed milk and airy foam.", price: 4.25, image: STOCK.cappuccino, alt: "Cappuccino in a ceramic mug", bestseller: true, featured: true },
  { cat: "espresso", name: "Pour Over", description: "Single-origin coffee, slow-brewed by hand.", price: 4.75, image: STOCK.pourOver, alt: "Coffee being poured into a black mug", tags: ["Single origin"] },
  { cat: "milk", name: "Flat White", description: "Velvety micro-foam over a rich ristretto.", price: 4.5, image: STOCK.flatWhite, alt: "Flat white in a white cup and saucer", featured: true },
  { cat: "milk", name: "Caramel Latte", description: "House caramel, espresso and steamed milk.", price: 5.25, image: STOCK.caramelLatte, alt: "Latte seen from above", bestseller: true, featured: true, tags: ["Sweet"] },
  { cat: "milk", name: "Honey Latte", description: "Wildflower honey and a pinch of cinnamon.", price: 5.0, image: STOCK.heartLatte, alt: "Latte with heart latte art", featured: true },
  { cat: "cold", name: "Iced Latte", description: "Espresso over ice with your choice of milk.", price: 4.75, image: STOCK.icedLatte, alt: "Iced latte in a glass", bestseller: true },
  { cat: "cold", name: "Cold Brew", description: "Steeped for 18 hours. Smooth, low acidity.", price: 4.5, image: STOCK.coldBrew, alt: "Cold brew coffee in a jar with ice", bestseller: true, tags: ["18-hour steep"] },
  { cat: "tea", name: "Matcha Latte", description: "Ceremonial-grade matcha whisked with steamed milk.", price: 5.5, image: STOCK.matcha, alt: "Matcha latte with latte art", featured: true },
  { cat: "tea", name: "Iced Matcha", description: "Bright, creamy and refreshing.", price: 5.5, image: STOCK.icedMatcha, alt: "Iced matcha latte in a glass" },
  { cat: "bakery", name: "Butter Croissant", description: "Flaky, golden and baked every morning.", price: 3.5, image: STOCK.croissant, alt: "Two butter croissants", bestseller: true },
  { cat: "bakery", name: "Pain au Chocolat", description: "Buttery layers with dark chocolate.", price: 3.95, image: STOCK.pastries, alt: "Croissants and chocolate pastries on a board" },
];

export const SEED_TEAM = [
  { name: "Maya", role: "Head Barista", bio: "Latte-art perfectionist and resident pour-over nerd.", photo: STOCK.team1, alt: "Barista holding a milk pitcher" },
  { name: "Leo", role: "Coffee Roaster", bio: "Hunts down the beans and dials in every roast.", photo: STOCK.team2, alt: "Barista pouring coffee" },
  { name: "Sara", role: "Pastry Chef", bio: "Up before sunrise so the croissants are warm when you arrive.", photo: STOCK.team3, alt: "Smiling team member in glasses" },
  { name: "Omar", role: "Café Manager", bio: "Keeps the music right and the queue moving.", photo: STOCK.team4, alt: "Team member holding a kettle" },
];
