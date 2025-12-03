import { useState, useEffect } from "react";
import playlistContent from "../assets/playlist.txt?raw";

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChannels = () => {
      setIsLoading(true);
      setError(null);

      // Use setTimeout to allow UI to update before heavy parsing
      setTimeout(() => {
        try {
          console.log("Loading channels from local playlist...");
          const lines = playlistContent.split("\n");
          const newChannels = [];
          let tempChannel = {};

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("#EXTINF:")) {
              tempChannel = {};
              const logoMatch = line.match(/tvg-logo="([^"]*)"/);
              const groupMatch = line.match(/group-title="([^"]*)"/);
              const nameMatch = line.match(/,(.+)$/);

              if (logoMatch) tempChannel.logo = logoMatch[1];
              if (groupMatch)
                tempChannel.category = groupMatch[1] || "Uncategorized";
              if (nameMatch) tempChannel.name = nameMatch[1].trim();
              tempChannel.id = `local-${newChannels.length}`;
            } else if (line.startsWith("http")) {
              // Use URL directly from playlist
              let src = line;

              // Force HLS format if not present
              if (!src.endsWith(".m3u8")) {
                src += ".m3u8";
              }

              tempChannel.src = src;
              tempChannel.type = "application/x-mpegURL";
              if (tempChannel.name) newChannels.push(tempChannel);
            }
          }

          // Test channel is now returned separately

          setChannels(newChannels);
          const cats = [
            "All",
            ...new Set(newChannels.map((c) => c.category).filter(Boolean)),
          ];
          setCategories(cats);
        } catch (err) {
          console.error("Error loading channels:", err);
          setError("Failed to load local playlist.");
        } finally {
          setIsLoading(false);
        }
      }, 10);
    };

    loadChannels();
  }, []);

  return {
    channels,
    categories,
    isLoading,
    error,
    testChannel: {
      id: "test-channel",
      name: "TEST CHANNEL (Big Buck Bunny)",
      category: "Debug",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg",
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      type: "application/x-mpegURL",
    },
  };
};
