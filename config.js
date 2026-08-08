/* ============================================================
   OURFLIX — CONFIGURATION FILE
   ============================================================
   This is the ONLY file you need to edit to make this site yours.
   No HTML or CSS knowledge required past this point.

   HOW GOOGLE DRIVE LINKS WORK
   ----------------------------
   1. Upload your video/photo to Google Drive.
   2. Right click → Share → "Anyone with the link" → Copy link.
   3. Paste that link exactly as Google gives it to you, e.g.
        https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing
      or
        https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp
   4. Paste it straight into the fields below — the site converts
      it automatically. Don't rename or shorten it.

   Everything below is just plain data. Replace the placeholder
   values with your own. Add or remove entries freely — the whole
   site rebuilds itself from these arrays automatically.
   ============================================================ */

const CONFIG = {
  // ---- Login ----------------------------------------------------
  username: "always",
  password: "forever",

  // ---- People -----------------------------------------------------
  girlfriendName: "My Love",
  girlfriendProfilePhoto: "", // Google Drive link or leave blank for default heart icon
  myName: "Me",
  myProfilePhoto: "", // Google Drive link or leave blank for default icon

  // ---- Brand --------------------------------------------------
  siteTitle: "OurFlix",
  tagline: "A story only the two of us are watching.",

  // ---- Hero banner on the home screen ----------------------------
  hero: {
    title: "Us.",
    description:
      "Two people, countless memories, and a love story still airing new episodes. Press play on us.",
    // Google Drive link to a short looping background video (optional — falls back to a gradient if empty)
    backgroundVideo: "https://drive.google.com/file/d/1jEsVq7TXl1Eez1Pyr8YtVIfKULz9el5R/view?usp=drivesdk",
    backgroundImage: "", // Google Drive link to a still image fallback
  },

  // ---- Background music -------------------------------------------
  backgroundMusic: "", // Google Drive link to an instrumental mp3

  // ---- Daily rotating romantic quotes (shown as a small ticker) ----
  dailyQuotes: [
    "You are my favorite notification.",
    "Every scene is better with you in it.",
    "Home isn't a place, it's you.",
    "I'd choose you in every timeline.",
    "You're the plot twist I never saw coming.",
    "Still not over how lucky I am.",
    "My favorite genre is 'us'.",
  ],

  // ---- Secret Konami-code page -------------------------------------
  easterEgg: {
    title: "You found the hidden episode.",
    message:
      "This one isn't in the catalogue. It's just for you — a quiet reminder that I'd pick this life, this love, and this us, over and over again.",
  },
};

/* ============================================================
   VIDEOS
   Each object becomes one card. "category" controls which
   horizontal row it appears in — use any category name you like,
   rows are generated automatically for every unique category.
   ============================================================ */
const VIDEOS = [
  {
    title: "Our First Date",
    description: "The beginning of everything.",
    poster: "",
    video: "https://drive.google.com/file/d/1jEsVq7TXl1Eez1Pyr8YtVIfKULz9el5R/view?usp=drivesdk",
    duration: "12m",
    year: "2023",
    category: "Favorite Memories",
  },
  {
    title: "That Road Trip",
    description: "Wrong turns, right person.",
    poster: "",
    video: "",
    duration: "24m",
    year: "2023",
    category: "Trips",
  },
  {
    title: "The Time You Laughed So Hard You Cried",
    description: "Still the funniest thing I've ever filmed.",
    poster: "",
    video: "",
    duration: "3m",
    year: "2024",
    category: "Funny Videos",
  },
  {
    title: "Your Birthday Surprise",
    description: "Worth every second of planning in secret.",
    poster: "",
    video: "",
    duration: "8m",
    year: "2024",
    category: "Special Moments",
  },
  {
    title: "The Beach Trip",
    description: "Salt water, sunburn, and you.",
    poster: "",
    video: "",
    duration: "18m",
    year: "2024",
    category: "Trips",
  },
  {
    title: "Rainy Day In",
    description: "Doing nothing was never this good.",
    poster: "",
    video: "",
    duration: "6m",
    year: "2024",
    category: "Favorite Memories",
  },
  {
    title: "A Message For Only You",
    description: "Not for the algorithm. Just for you.",
    poster: "",
    video: "",
    duration: "2m",
    year: "2024",
    category: "Hidden Memories",
  },
];

/* ============================================================
   PHOTOS
   Shown in the Gallery page as a masonry grid.
   ============================================================ */
const PHOTOS = [
  {
    title: "Golden Hour",
    image: "",
    category: "Us",
  },
  {
    title: "Coffee Dates",
    image: "",
    category: "Everyday",
  },
  {
    title: "That Trip",
    image: "",
    category: "Trips",
  },
];

/* ============================================================
   REELS
   Vertical, swipeable, one video per screen — like Instagram Reels.
   ============================================================ */
const REELS = [
  {
    title: "30 seconds of us being ridiculous",
    video: "",
    caption: "No context needed.",
  },
  {
    title: "Dancing badly in the kitchen",
    video: "",
    caption: "Still our best duet.",
  },
];

/* ============================================================
   LOVE LETTERS
   Each opens as an animated envelope with a handwritten-style letter.
   ============================================================ */
const LETTERS = [
  {
    title: "For the day we met",
    date: "The day it all started",
    body:
      "I didn't know a single conversation could rearrange my whole life, but somehow you did exactly that. Every day since has felt like a page I actually want to turn.",
  },
  {
    title: "For your bad days",
    date: "Open anytime",
    body:
      "Whatever today handed you, I want you to know that I see how hard you try, and I am so endlessly proud to be the person you come home to.",
  },
  {
    title: "For no reason at all",
    date: "Just because",
    body:
      "Sometimes I just think about you in the middle of a totally normal moment and smile like an idiot. This letter is proof. That's it. That's the whole letter.",
  },
];
