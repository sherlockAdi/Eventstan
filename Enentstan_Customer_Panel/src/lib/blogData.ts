// lib/blogData.ts
// API Integration: replace BLOG_POSTS with API fetch
// e.g. const posts = await fetch('/api/blog').then(r => r.json())

export type BlogCategory =
  | "All"
  | "Trends"
  | "Venues"
  | "Decor"
  | "Catering"
  | "Entertainment"
  | "Planning Tips"
  | "Real Events";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string — replace with MDX/rich text from API
  category: Exclude<BlogCategory, "All">;
  author: string;
  read_time: number; // minutes
  image_url: string;
  tags: string[];
  published_at: string;
  is_featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "top-10-wedding-venue-trends-2025",
    title: "Top 10 Wedding Venue Trends for 2025",
    excerpt:
      "From intimate garden settings to industrial chic warehouses, discover the venue styles taking over 2025 weddings.",
    content: `
      <h2>Top 10 Wedding Venue Trends for 2025</h2>
      <p>The wedding industry is constantly evolving, and 2025 is shaping up to be a year of bold choices and deeply personal spaces. Here are the top venue trends we're seeing.</p>
      <h3>1. Micro-Wedding Estates</h3>
      <p>Small is the new big. Intimate gatherings of 20–50 guests in private estates are on the rise, allowing couples to invest more in quality over quantity.</p>
      <h3>2. Industrial Chic Warehouses</h3>
      <p>Converted warehouses with exposed brick, steel beams, and dramatic lighting continue to captivate couples who want an edgy, artistic backdrop.</p>
      <h3>3. Lush Garden & Botanical Venues</h3>
      <p>Greenery-filled spaces — think conservatories, botanical gardens, and forest clearings — are perfect for couples embracing the biophilic design movement.</p>
      <h3>4. Destination Vineyards</h3>
      <p>Winery venues offer rolling landscapes, rustic charm, and in-house catering that's hard to beat.</p>
      <h3>5. Rooftop Celebrations</h3>
      <p>Skyline views provide a dramatic backdrop for evening ceremonies, and rooftop venues in urban centers are becoming more accessible.</p>
      <h3>6. Cultural & Heritage Sites</h3>
      <p>Historic buildings, museums, and cultural landmarks bring a sense of grandeur and storytelling to the big day.</p>
      <h3>7. Beach & Coastal Venues</h3>
      <p>The allure of the ocean never fades. Beachfront venues with natural light and open skies remain perennial favourites.</p>
      <h3>8. Farm-to-Table Farm Venues</h3>
      <p>Rustic barns paired with farm-fresh catering create an authentic, wholesome experience.</p>
      <h3>9. Private Yachts & Boats</h3>
      <p>For a truly unique experience, floating venues offer exclusivity and stunning water views.</p>
      <h3>10. Art Galleries</h3>
      <p>Minimalist white walls and curated artwork create a sophisticated atmosphere that doubles as a built-in decoration scheme.</p>
    `,
    category: "Venues",
    author: "EventStan Editorial",
    read_time: 6,
    image_url:
      "/images/categories/venue.jpg",
    tags: ["wedding", "venues", "trends", "2025"],
    published_at: "2025-03-15",
    is_featured: true,
  },
  {
    slug: "rise-of-micro-weddings",
    title: "The Rise of Micro-Weddings: Why Less Is More",
    excerpt:
      "Intimate ceremonies are redefining what it means to celebrate love. Here's why couples are choosing quality over quantity.",
    content: `
      <h2>The Rise of Micro-Weddings</h2>
      <p>Micro-weddings — those with fewer than 50 guests — have skyrocketed in popularity. Far from being a compromise, they represent a deliberate, deeply personal choice.</p>
      <p>When you cut the guest list, you free up budget for what truly matters: an exceptional venue, world-class catering, and unforgettable details that would otherwise get lost in a crowd of 300.</p>
      <h3>The Budget Advantage</h3>
      <p>A smaller headcount means you can redirect spend toward a premium open bar, a renowned chef, or a venue with true wow-factor — things that leave a lasting impression on every single guest.</p>
      <h3>Intimacy That Can't Be Manufactured</h3>
      <p>With 20 guests instead of 200, every person in the room truly matters to you. Conversations are meaningful, moments are shared, and the atmosphere carries an emotional weight that large weddings rarely achieve.</p>
    `,
    category: "Trends",
    author: "EventStan Editorial",
    read_time: 4,
    image_url:
      "/images/blog/blog-1.jpg",
    tags: ["wedding", "micro-wedding", "trends"],
    published_at: "2025-03-10",
  },
  {
    slug: "how-to-plan-corporate-event",
    title: "How to Plan a Corporate Event That People Actually Enjoy",
    excerpt:
      "Stop making your team sit through boring presentations. A guide to corporate events that leave people energised.",
    content: `
      <h2>How to Plan a Corporate Event People Actually Enjoy</h2>
      <p>The corporate event has a reputation problem. Years of bland hotel ballrooms and PowerPoint-heavy agendas have conditioned employees to dread the invite. Here's how to flip the script.</p>
      <h3>Lead With Experience, Not Agenda</h3>
      <p>Before you book a venue, ask: what do we want people to feel when they leave? Inspired? Connected? Energised? Let the answer drive every decision.</p>
      <h3>Choose a Venue That Does Some of the Work</h3>
      <p>A rooftop, a gallery, a working studio — distinctive spaces create natural talking points and remove the pressure of manufactured icebreakers.</p>
    `,
    category: "Planning Tips",
    author: "Liam Nkosi",
    read_time: 5,
    image_url:
      "/images/blog/blog-2.jpg",
    tags: ["corporate", "planning", "events"],
    published_at: "2025-03-08",
  },
  {
    slug: "stunning-garden-wedding-cape-town",
    title: "A Stunning Garden Wedding in Cape Town",
    excerpt:
      "Real couple, real flowers, real magic. A look inside one of our favourite EventStan weddings of the year.",
    content: `
      <h2>A Stunning Garden Wedding in Cape Town</h2>
      <p>When Amara and Theo decided to get married, they knew one thing: they wanted to be surrounded by nature. Cape Town's lush winelands provided the perfect canvas.</p>
      <p>Working with an EventStan-sourced florist, they transformed a private estate into a riot of proteas, fynbos, and trailing jasmine. The result? A wedding that felt completely of the place.</p>
    `,
    category: "Real Events",
    author: "Zanele Dube",
    read_time: 3,
    image_url:
      "/images/blog/blog-3.jpg",
    tags: ["real-events", "wedding", "garden"],
    published_at: "2025-03-05",
  },
  {
    slug: "decor-trends-dominating-2025",
    title: "Decor Trends Dominating Events in 2025",
    excerpt:
      "Maximalist tablescapes, sustainable florals, and unexpected textures — here's what's defining event aesthetics this year.",
    content: `
      <h2>Decor Trends Dominating Events in 2025</h2>
      <p>Event decor in 2025 is anything but safe. Designers are pushing boundaries with bold material choices, unexpected colour palettes, and a renewed commitment to sustainability.</p>
      <h3>Sustainable Florals</h3>
      <p>Dried flowers, potted plants, and locally sourced seasonal blooms are replacing imported roses. They photograph beautifully and have a life beyond the event.</p>
      <h3>Maximalist Tablescapes</h3>
      <p>More is more when it comes to table styling. Layered textures, mixed metals, and abundant greenery are replacing the sparse minimalism of the last decade.</p>
    `,
    category: "Decor",
    author: "Aisha Mokoena",
    read_time: 4,
    image_url:
      "/images/blog/blog-7.jpg",
    tags: ["decor", "trends", "2025"],
    published_at: "2025-03-01",
  },
  {
    slug: "best-catering-styles-for-weddings",
    title: "The Best Catering Styles for Your Wedding",
    excerpt:
      "Plated dinner vs. food stations vs. grazing tables — we break down the pros, cons, and perfect pairings for each format.",
    content: `
      <h2>The Best Catering Styles for Your Wedding</h2>
      <p>Food is one of the most memorable parts of any wedding. The format you choose shapes the entire atmosphere of the reception.</p>
      <h3>Plated Dinners</h3>
      <p>Elegant, controlled, and classic. A plated dinner signals formality and allows for precise dietary management. Best for weddings of 100 or fewer guests where service speed is manageable.</p>
      <h3>Food Stations</h3>
      <p>Interactive and social, stations encourage guests to mingle and graze. A carving station, a pasta bar, and a dessert counter create a festive, abundant atmosphere.</p>
    `,
    category: "Catering",
    author: "EventStan Editorial",
    read_time: 5,
    image_url:
      "/images/blog/blog-8.jpg",
    tags: ["catering", "wedding", "food"],
    published_at: "2025-02-25",
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
  "All",
  "Trends",
  "Venues",
  "Decor",
  "Catering",
  "Entertainment",
  "Planning Tips",
  "Real Events",
];

// Category color mapping
export const CATEGORY_COLORS: Record<string, string> = {
  Trends: "bg-purple-100 text-purple-700",
  Venues: "bg-blue-100 text-blue-700",
  Decor: "bg-pink-100 text-pink-700",
  Catering: "bg-green-100 text-green-700",
  Entertainment: "bg-yellow-100 text-yellow-700",
  "Planning Tips": "bg-cyan-100 text-cyan-700",
  "Real Events": "bg-orange-100 text-orange-700",
};