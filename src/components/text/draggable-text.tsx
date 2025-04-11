"use client";

import { useState, useRef, useEffect } from "react";
import { useText, TextElement } from "@/lib/context/text-context";

interface DraggableTextProps {
  textElement: TextElement;
  canvasRect: DOMRect | null;
}

export function DraggableText({ textElement, canvasRect }: DraggableTextProps) {
  const { updateTextElement, selectTextElement } = useText();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for starting drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Select this text element
    selectTextElement(textElement.id);
    
    // Calculate offset from mouse position to element position
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    setIsDragging(true);
  };

  // Set up global mouse move and mouse up event listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRect) return;
      
      // Calculate new position relative to canvas
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Ensure text stays within canvas bounds
      const x = Math.max(0, Math.min(newX, canvasRect.width - (textRef.current?.offsetWidth || 0)));
      const y = Math.max(0, Math.min(newY, canvasRect.height - (textRef.current?.offsetHeight || 0)));
      
      updateTextElement(textElement.id, { position: { x, y } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Handle touch events for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!canvasRect || e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      
      // Calculate new position relative to canvas
      const newX = touch.clientX - canvasRect.left - dragOffset.x;
      const newY = touch.clientY - canvasRect.top - dragOffset.y;
      
      // Ensure text stays within canvas bounds
      const x = Math.max(0, Math.min(newX, canvasRect.width - (textRef.current?.offsetWidth || 0)));
      const y = Math.max(0, Math.min(newY, canvasRect.height - (textRef.current?.offsetHeight || 0)));
      
      updateTextElement(textElement.id, { position: { x, y } });
      
      e.preventDefault(); // Prevent scrolling while dragging
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    // Clean up
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, canvasRect, dragOffset, textElement.id, updateTextElement]);

  return (
    <div
      ref={textRef}
      className={`absolute select-none cursor-move ${textElement.isSelected ? 'ring-2 ring-violet-500 animate-glow' : ''}`}
      style={{
        left: `${textElement.position.x}px`,
        top: `${textElement.position.y}px`,
        zIndex: textElement.zIndex,
        fontSize: `${textElement.fontSize}px`,
        color: textElement.color,
        padding: '4px',
        borderRadius: '4px',
        userSelect: 'none',
        touchAction: 'none', // Disable default touch behavior
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        e.stopPropagation();
        selectTextElement(textElement.id);
        
        if (textRef.current) {
          const rect = textRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          });
        }
        
        setIsDragging(true);
      }}
    >
      {textElement.text}
    </div>
  );
}
