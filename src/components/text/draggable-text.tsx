"use client";

import { useState, useRef, useEffect } from "react";
import { useText, TextElement, PathPoint } from "@/lib/context/text-context";


const distance = (p1: PathPoint, p2: PathPoint): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getPathLength = (path: PathPoint[], closed: boolean): number => {
  if (path.length <= 1) return 0;
  
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    length += distance(path[i], path[i + 1]);
  }
  
  if (closed && path.length > 1) {
    length += distance(path[path.length - 1], path[0]);
  }
  
  return length;
};

const generatePathD = (points: PathPoint[], closed: boolean): string => {
  if (points.length < 1) return '';
  
  let d = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  
  if (closed && points.length > 1) {
    d += ' Z'; // Close the path
  }
  
  return d;
};


interface DraggableTextProps {
  textElement: TextElement;
  canvasRect: DOMRect | null;
}

interface SvgPathTextProps {
  textElement: TextElement;
}


function SvgPathText({ textElement }: SvgPathTextProps) {
  const { selectTextElement } = useText();
  const pathId = `textpath-${textElement.id}`;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectTextElement(textElement.id);
  };

  const getTextPathContent = () => {
    const { path, text, fontSize, pathClosed, spaceBetween } = textElement;
    const words = text.trim().split(/\s+/); // Split text into words
    if (words.length === 0) return '';

    if (path.length < 2) return text;

    const pathLength = getPathLength(path, pathClosed);
    if (pathLength === 0) return text;

    const avgCharWidth = fontSize * 0.6;
    const sequenceWidth = words.reduce((sum, word) => sum + word.length * avgCharWidth, 0) 
                          + Math.max(0, words.length - 1) * spaceBetween; // Add space between words

    const numRepetitions = Math.max(1, Math.floor(pathLength / (sequenceWidth + spaceBetween))); 
    
    // Build the final string with repeated words
    let content = '';
    for (let i = 0; i < numRepetitions; i++) {
      content += words.join(' ') + ' '; // Add space after each sequence
    }
    return content.trim();
  };

 
  if (textElement.path.length < 2) {
    return (
      <div
        className={`absolute select-none ${textElement.isSelected ? 'ring-2 ring-violet-500 animate-glow' : ''} cursor-crosshair`}
        style={{
          left: textElement.path.length === 1 ? `${textElement.path[0].x}px` : `${textElement.position.x}px`,
          top: textElement.path.length === 1 ? `${textElement.path[0].y}px` : `${textElement.position.y}px`,
          zIndex: textElement.zIndex,
          fontSize: `${textElement.fontSize}px`,
          color: textElement.color,
          padding: '4px',
          transform: 'translate(-50%, -50%)', // Center at the starting point
          pointerEvents: 'all', // Make sure it's clickable
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
        onClick={handleSelect}
      >
        {textElement.text}
        {/* Show guidance for continuing to drag */}
        {textElement.isSelected && (
          <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-violet-200 font-semibold whitespace-nowrap w-40 -ml-16">
            Continue dragging to create path
          </div>
        )}
      </div>
    );
  }

  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: textElement.zIndex }}
    >
      <defs>
        <path 
          id={pathId} 
          d={generatePathD(textElement.path, textElement.pathClosed)}
          fill="none"
        />
      </defs>

      {textElement.isSelected && (
        <path
          d={generatePathD(textElement.path, textElement.pathClosed)}
          fill="none"
          stroke="rgba(139, 92, 246, 0.7)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="pointer-events-auto cursor-pointer" // Allow clicking path to select
          onClick={handleSelect} 
        />
      )}

      <text
        fontSize={textElement.fontSize}
        fill={textElement.color}
        dy="0.35em" // Vertically center text on path slightly better
        className="pointer-events-auto cursor-pointer select-none"
        onClick={handleSelect} // Allow clicking text to select
      >
        <textPath href={`#${pathId}`} wordSpacing={textElement.spaceBetween}>
          {getTextPathContent()}
        </textPath>
      </text>

      {/* Control points visualization */}
      {textElement.isSelected && textElement.path.map((point, i) => (
        <circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r="5" // Slightly larger points
          fill="rgba(139, 92, 246, 0.8)" // Use violet color
          stroke="white"
          strokeWidth="1"
          className="pointer-events-auto cursor-pointer" // Allow clicking points
          onClick={handleSelect} // Click point selects element
        />
      ))}
    </svg>
  );
}



export function DraggableText({ textElement, canvasRect }: DraggableTextProps) {
  const { selectTextElement, addPathPoint } = useText();
  const [isPathDrawing, setIsPathDrawing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // --- Event Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectTextElement(textElement.id);

    // Start drawing path on drag
    setIsPathDrawing(true);
    
    // Add the starting point at current mouse position
    if (canvasRect) {
      // Get mouse position relative to canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // If text already has path points, start from the last one
      // Otherwise start a new path from the initial text position
      if (textElement.path.length === 0) {
        // Start path from text center rather than corner
        const textCenterX = textElement.position.x + (textRef.current?.offsetWidth || 0) / 2;
        const textCenterY = textElement.position.y + (textRef.current?.offsetHeight || 0) / 2;
        
        // Add initial point at text center
        addPathPoint(textElement.id, { x: textCenterX, y: textCenterY });
      }
      
      // Add point at current mouse position (but only if it's different from the last point)
      const lastPoint = textElement.path[textElement.path.length - 1];
      if (!lastPoint || distance({ x: mouseX, y: mouseY }, lastPoint) > 5) {
        addPathPoint(textElement.id, { x: mouseX, y: mouseY });
      }
    }
  };

  // --- Mouse/Touch Move Effect ---

  useEffect(() => {
    if (!isPathDrawing) return;
    if (!canvasRect) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Add points to path while dragging
      const lastPoint = textElement.path[textElement.path.length - 1];
      const distThreshold = 10; // Min distance to add new point
        
      if (!lastPoint || distance({x: mouseX, y: mouseY}, lastPoint) > distThreshold) {
        addPathPoint(textElement.id, { x: mouseX, y: mouseY });
      }
    };

    const handleMouseUp = () => {
      setIsPathDrawing(false);
    };

    // Handle touch events
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const touchX = touch.clientX - canvasRect.left;
      const touchY = touch.clientY - canvasRect.top;

      // Add points to path while dragging
      const lastPoint = textElement.path[textElement.path.length - 1];
      const distThreshold = 10;
      if (!lastPoint || distance({x: touchX, y: touchY}, lastPoint) > distThreshold) {
        addPathPoint(textElement.id, { x: touchX, y: touchY });
      }
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      setIsPathDrawing(false);
    };

    // Add listeners
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
  }, [isPathDrawing, canvasRect, textElement, addPathPoint]);

  // --- Render Logic ---

  // Always use SvgPathText once we have at least one path point
  if (textElement.path.length > 0) {
    return <SvgPathText textElement={textElement} />;
  }

  // Otherwise render the initial draggable text
  return (
    <div
      ref={textRef}
      className={`absolute select-none ${textElement.isSelected ? 'ring-2 ring-violet-500 animate-glow' : ''} cursor-crosshair`}
      style={{
        left: `${textElement.position.x}px`,
        top: `${textElement.position.y}px`,
        zIndex: textElement.zIndex,
        fontSize: `${textElement.fontSize}px`,
        color: textElement.color,
        padding: '4px',
        borderRadius: '4px',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        e.stopPropagation();
        selectTextElement(textElement.id);
        
        // Start path drawing
        setIsPathDrawing(true);
        if (canvasRect) {
          const touch = e.touches[0];
          const touchX = touch.clientX - canvasRect.left;
          const touchY = touch.clientY - canvasRect.top;
          
          // If text has no path points yet, start from text center
          if (textElement.path.length === 0) {
            const textCenterX = textElement.position.x + (textRef.current?.offsetWidth || 0) / 2;
            const textCenterY = textElement.position.y + (textRef.current?.offsetHeight || 0) / 2;
            addPathPoint(textElement.id, { x: textCenterX, y: textCenterY });
          }
          
          // Add point at touch position if different from last point
          const lastPoint = textElement.path[textElement.path.length - 1];
          if (!lastPoint || distance({ x: touchX, y: touchY }, lastPoint) > 5) {
            addPathPoint(textElement.id, { x: touchX, y: touchY });
          }
        }
      }}
    >
      {textElement.text}
      {textElement.isSelected && (
        <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-violet-200 font-semibold">
          Drag to create path
        </div>
      )}
    </div>
  );
}
