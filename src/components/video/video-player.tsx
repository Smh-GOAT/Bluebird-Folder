"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import type { VideoPlatform } from "@/types";
import { useVideoTime } from "../summary/video-time-context";

interface VideoPlayerProps {
  videoUrl: string;
  platform: VideoPlatform;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ videoUrl, platform, currentTime, onTimeUpdate }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerSeekHandler, unregisterSeekHandler } = useVideoTime();
  const [embedUrlWithTime, setEmbedUrlWithTime] = useState<string>("");

  // Generate embed URL based on platform
  const baseEmbedUrl = useMemo(() => {
    if (platform === "bilibili") {
      // Extract BV/AV ID from URL and construct embed URL
      const match = videoUrl.match(/(?:bvid=|BV|av)([a-zA-Z0-9]+)/i);
      if (match) {
        const bvid = match[1].startsWith("BV") ? match[1] : `BV${match[1]}`;
        return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=0&controls=1`;
      }
      return videoUrl;
    }
    
    if (platform === "youtube") {
      // Extract video ID from YouTube URL
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/i);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1`;
      }
      return videoUrl;
    }
    
    return videoUrl;
  }, [videoUrl, platform]);

  // Set initial embed URL
  useEffect(() => {
    setEmbedUrlWithTime(baseEmbedUrl);
  }, [baseEmbedUrl]);

  // Register seek handler
  useEffect(() => {
    const handleSeek = (time: number) => {
      let newUrl = baseEmbedUrl;
      
      if (platform === "bilibili") {
        // Bilibili uses &t= for time offset in seconds
        newUrl = `${baseEmbedUrl}&t=${Math.floor(time)}`;
      } else if (platform === "youtube") {
        // YouTube uses &start= for time offset in seconds
        newUrl = `${baseEmbedUrl}&start=${Math.floor(time)}`;
      }
      
      setEmbedUrlWithTime(newUrl);
    };

    registerSeekHandler(handleSeek);
    
    return () => {
      unregisterSeekHandler(handleSeek);
    };
  }, [baseEmbedUrl, platform, registerSeekHandler, unregisterSeekHandler]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        key={embedUrlWithTime}
        ref={iframeRef}
        src={embedUrlWithTime}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video Player"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
