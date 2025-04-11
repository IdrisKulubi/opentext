"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { TextProvider } from "@/lib/context/text-context";
import { TextLayer } from "@/components/text/text-layer";
import { TextControls } from "@/components/text/text-controls";

interface ImageCanvasProps {
  imageKey: string | null;
}

export function ImageCanvas({ imageKey }: ImageCanvasProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageKey) return;

    setIsLoading(true);
    setError(null);

    try {
      // Retrieve image from localStorage
      const storedImage = localStorage.getItem(imageKey);
      
      if (!storedImage) {
        setError("Image not found in storage");
        setIsLoading(false);
        return;
      }

      // Create a new image element to get dimensions
      const img = new window.Image();
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height,
        });
        setImageSrc(storedImage);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setError("Failed to load image");
        setIsLoading(false);
      };
      
      img.src = storedImage;
    } catch (err) {
      console.error("Error loading image:", err);
      setError("An error occurred while loading the image");
      setIsLoading(false);
    }
  }, [imageKey]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-secondary/30 rounded-lg card-futuristic">
        <div className="size-12 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-secondary/30 rounded-lg card-futuristic">
        <p className="text-muted-foreground">{error || "No image selected"}</p>
      </div>
    );
  }

  return (
    <TextProvider>
      <div className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg card-futuristic">
          <div 
            ref={canvasRef}
            className="relative flex items-center justify-center p-4 min-h-96 bg-secondary/30"
          >
            <div 
              className="relative rounded-lg overflow-hidden shadow-lg"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
              }}
            >
              <div className="relative">
                <Image
                  src={imageSrc}
                  width={dimensions.width}
                  height={dimensions.height}
                  alt="Uploaded image"
                  className="max-w-full max-h-[70vh] object-contain"
                  priority
                />
                <TextLayer containerRef={canvasRef as React.RefObject<HTMLDivElement>} />
              </div>
            </div>
          </div>
        </div>
        
        <TextControls />
      </div>
    </TextProvider>
  );
} 