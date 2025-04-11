"use client";

import { useEffect, useState } from "react";
import { useText } from "@/lib/context/text-context";
import { DraggableText } from "./draggable-text";

interface TextLayerProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function TextLayer({ containerRef }: TextLayerProps) {
  const { textElements, selectTextElement } = useText();
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  
  // Update canvas rect on resize
  useEffect(() => {
    const updateCanvasRect = () => {
      if (containerRef.current) {
        setCanvasRect(containerRef.current.getBoundingClientRect());
      }
    };
    
    // Initial update
    updateCanvasRect();
    
    // Update on resize
    window.addEventListener("resize", updateCanvasRect);
    
    return () => {
      window.removeEventListener("resize", updateCanvasRect);
    };
  }, [containerRef]);
  
  // Handle click on the background to deselect
  const handleBackgroundClick = () => {
    selectTextElement(null);
  };
  
  // Render text elements - each DraggableText will:
  // 1. Show as regular text if not in path mode
  // 2. Show as regular text if in path mode but no path drawn yet
  // 3. Show as path text if in path mode with path points
  // Users can double-click any text to toggle path mode
  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {textElements.map((textElement) => (
        <DraggableText 
          key={textElement.id} 
          textElement={textElement} 
          canvasRect={canvasRect}
        />
      ))}
    </div>
  );
}
