# Live TV Web App

A modern, responsive web application for streaming Live TV channels. Built with React, Vite, and Video.js.

![Live TV App](https://via.placeholder.com/800x450?text=Live+TV+App+Screenshot)

## Features

- 📺 **Live Streaming**: Supports HLS (.m3u8) playback using Video.js.
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices.
- 📂 **Local Playlist**: Loads channels directly from a local `playlist.txt` file (bypassing IDM/browser download issues).
- ⚡ **Fast Performance**: Optimized rendering with content-visibility and smooth scrolling.
- 💾 **Auto-Resume**: Remembers the last played channel and restores it on reload.
- 🔍 **Categories**: Easy navigation with channel categories.
- 🛡️ **Proxy Support**: Built-in Vite proxy to handle CORS and Mixed Content issues during development.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS v4
- **Player**: Video.js with `videojs-contrib-eme` (DRM support ready)
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/CodesRahul96/Live-TV.git
    cd Live-TV
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Setup Playlist:**
    - Place your M3U playlist content in `src/assets/playlist.txt`.
    - _Note: The file must be named `.txt` to prevent download managers (like IDM) from intercepting it._

## Usage

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

2.  **Open the app:**
    - Navigate to `http://localhost:5173` in your browser.

## Configuration

### Proxy & CORS

The application uses a local proxy configured in `vite.config.js` to route stream requests. This is essential to bypass CORS restrictions and Mixed Content errors (playing HTTP streams on an HTTPS/localhost page).

- **Target**: `http://agh2019.xyz:80` (Default)
- **Route**: `/xtream`

The `App.jsx` automatically rewrites stream URLs to use this proxy during development.

### Playlist Format

The app expects a standard Extended M3U format (`#EXTM3U`).

- `#EXTINF` lines should contain `tvg-logo` and `group-title` attributes.
- Stream URLs are automatically detected and processed.

## Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.

## License

MIT
