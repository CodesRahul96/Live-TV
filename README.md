# Live TV Web App

A modern, responsive Live TV application built with React, Vite, and Tailwind CSS. Designed for a premium user experience across Mobile, Desktop, and TV.

## ✨ Features

### 📺 Video Playback

- **Custom HLS Player**: Built on top of `hls.js` for reliable streaming.
- **Resilient Playback**: Automatically switches to a fallback channel ("Big Buck Bunny") if a stream fails.
- **Mobile Optimization**: Automatic landscape orientation lock on fullscreen (Android).
- **Overlay Controls**: Custom UI for Play/Pause, Volume, and Fullscreen.

### 📋 Channel Management

- **Playlist Support**: Loads channels dynamically from `src/assets/playlist.txt`.
- **Smart Search**: Instant channel filtering by name.
- **Categorization**: Browse channels by categories (e.g., News, Sports, Movies).
- **Persistence**: Remembers your last watched channel.

### 🎨 UI/UX

- **Responsive Design**:
  - **Mobile**: Collapsible sidebar, touch-friendly controls.
  - **Desktop**: Persistent navigation, optimized layout.
  - **TV**: High contrast, clear focus indicators.
- **Smooth Transitions**: Fluid animations for sidebar and list items.
- **Dark Mode**: Sleek, glassmorphism-inspired dark theme.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Video Engine**: [hls.js](https://github.com/video-dev/hls.js)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/CodesRahul96/Live-TV.git
    cd Live-TV
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the development server**

    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📁 Project Structure

```
src/
├── assets/
│   └── playlist.txt       # M3U playlist source
├── components/
│   ├── ChannelList.jsx    # Sidebar with search & categories
│   ├── CustomPlayer.jsx   # HLS video player wrapper
│   └── Layout.jsx         # Main app shell & responsive layout
├── hooks/
│   └── useChannels.js     # Channel loading & parsing logic
├── App.jsx                # Main application logic
└── index.css              # Global styles & Tailwind directives
```

## 📝 Configuration

To update the channel list, simply edit `src/assets/playlist.txt`. The app expects a standard M3U format:

```m3u
#EXTM3U
#EXTINF:-1 group-title="Category" tvg-logo="url_to_logo",Channel Name
http://stream_url.m3u8
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
