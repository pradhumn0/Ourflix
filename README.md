# OurFlix — Setup Guide

## 1. Personalize everything
Open **config.js** — it's the only file you need to touch. Fill in:
- `username` / `password` — your login credentials
- `girlfriendName`, `myName`, profile photos (Google Drive links)
- `hero` — the home screen's title, description, and background
- `VIDEOS`, `PHOTOS`, `REELS`, `LETTERS` — your actual memories

## 2. Google Drive links
1. Upload a file to Drive → right-click → **Share** → "Anyone with the link" → **Copy link**.
2. Paste that exact link into config.js. The site converts it automatically — no need to extract file IDs yourself.
3. Note: very large video files can trigger Google's "can't scan for viruses" warning page instead of streaming directly. If a video doesn't play, try a smaller/compressed file, or host it on a direct-video host (e.g. Cloudinary, a Netlify/Vercel static bucket, or Firebase Storage) and paste that URL instead — the config accepts any direct video URL, not only Drive links.

## 3. Publish on GitHub Pages
1. Create a new GitHub repo and upload these files (`index.html`, `style.css`, `script.js`, `config.js`) plus the `assets/` folder.
2. Repo Settings → Pages → Deploy from branch → `main` → `/root`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## 4. Easter egg
Type the Konami code anywhere in the app (↑ ↑ ↓ ↓ ← → ← → B A) to unlock the hidden page. Edit the message in `CONFIG.easterEgg`.

## 5. Everything is local & private
No backend, no database. Favorites, watch progress, reel likes, and the music on/off preference are stored in the browser's local storage only — nothing leaves the device.

## What's included
- Cinematic intro loader → "Who's Watching?" profile picker → login → full app
- Netflix-style home with hero banner, quote ticker, and auto-generated horizontal rows (one per category in `VIDEOS`)
- Full-screen custom video player: play/pause, seek, volume, speed, fullscreen, picture-in-picture, resume-from-last-position, autoplay-next-in-category, keyboard shortcuts (space, ←/→, F, M, Esc)
- Photo Gallery — masonry grid with a swipeable/zoomable lightbox, right-click download disabled
- Reels — vertical swipe feed with autoplay-on-scroll, like/heart animation, double-tap to like
- Love Letters — animated wax-seal envelopes that unfold to reveal each letter
- Live search across videos, photos, and letters
- Favorites ("My List") and Continue Watching, both remembered per-browser
- Toggleable background music, remembered across visits
- Hidden Konami-code easter egg page with floating hearts
