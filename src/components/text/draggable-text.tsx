"use client";

import { useState, useEffect } from "react";
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

  // Get text style based on textElement properties
  const getTextStyle = () => {
    return {
      fontFamily: textElement.fontFamily,
      fontWeight: textElement.fontWeight,
      fontStyle: textElement.isItalic ? 'italic' : 'normal',
      textDecoration: textElement.isUnderlined ? 'underline' : 'none',
      textAnchor: textElement.textAlign === 'center' ? 'middle' : 
                  textElement.textAlign === 'right' ? 'end' : 'start',
    };
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
          fontFamily: textElement.fontFamily,
          fontWeight: textElement.fontWeight,
          fontStyle: textElement.isItalic ? 'italic' : 'normal',
          textDecoration: textElement.isUnderlined ? 'underline' : 'none',
          textAlign: textElement.textAlign,
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

  const textStyle = getTextStyle();

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
        fontFamily={textStyle.fontFamily}
        fontWeight={textStyle.fontWeight}
        fontStyle={textStyle.fontStyle}
        textDecoration={textStyle.textDecoration}
        textAnchor={textStyle.textAnchor}
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
        const textCenterX = textElement.position.x;
        const textCenterY = textElement.position.y;
        
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

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      
      const touch = e.touches[0];
      const touchX = touch.clientX - canvasRect.left;
      const touchY = touch.clientY - canvasRect.top;
      
      // Constrain to canvas boundaries
      const boundedX = Math.max(0, Math.min(canvasRect.width, touchX));
      const boundedY = Math.max(0, Math.min(canvasRect.height, touchY));
      
      const lastPoint = textElement.path[textElement.path.length - 1];
      const distThreshold = 10; // Min distance to add new point
      
      if (!lastPoint || distance({x: boundedX, y: boundedY}, lastPoint) > distThreshold) {
        addPathPoint(textElement.id, { x: boundedX, y: boundedY });
      }
    };

    const handleTouchEnd = () => {
      setIsPathDrawing(false);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPathDrawing, canvasRect, textElement, addPathPoint]);

  // Determine if we should render path text or regular text
  if (textElement.path.length >= 2) {
    return <SvgPathText textElement={textElement} />;
  }
  
  // For regular text with automatic repetition based on drag distance
  return <AutoRepeatText textElement={textElement} handleMouseDown={handleMouseDown} />;
}

// Component to render text with automatic repetition
function AutoRepeatText({ 
  textElement, 
  handleMouseDown 
}: { 
  textElement: TextElement, 
  handleMouseDown: (e: React.MouseEvent) => void
}) {
  const { selectTextElement, addPathPoint } = useText();
  
  // Calculate repetition based on current drag state
  const getRepetitionCount = () => {
    // When not actively dragging, use minimum repetition count
    if (textElement.path.length <= 1) {
      return textElement.repetitionCount;
    }
    
    // Calculate repetition based on drag distance
    const lastPoint = textElement.path[textElement.path.length - 1];
    const firstPoint = textElement.path[0];
    
    const dragDistance = distance(firstPoint, lastPoint);
    
    // Scale repetition based on distance (1 repetition for each 30px of drag)
    // Clamp to a reasonable range
    return Math.max(
      textElement.repetitionCount,
      Math.min(20, Math.ceil(dragDistance / 30))
    );
  };
  
  const repetitionCount = getRepetitionCount();
  const baseX = textElement.path.length === 1 ? textElement.path[0].x : textElement.position.x;
  const baseY = textElement.path.length === 1 ? textElement.path[0].y : textElement.position.y;
  const { horizontalSpacing, verticalSpacing, repetitionDirection } = textElement;
  
  // Calculate repetition grid dimensions based on direction
  let rows = 1;
  let cols = 1;
  
  if (repetitionDirection === "horizontal") {
    cols = repetitionCount;
  } else if (repetitionDirection === "vertical") {
    rows = repetitionCount;
  } else if (repetitionDirection === "both") {
    // Create a balanced grid - approximate a square
    rows = Math.ceil(Math.sqrt(repetitionCount));
    cols = Math.ceil(repetitionCount / rows);
  }
  
  // For single element case (no repetition yet)
  if (repetitionCount <= 1 || textElement.path.length === 0) {
    return (
      <div
        className={`absolute select-none ${textElement.isSelected ? 'ring-2 ring-violet-500 animate-glow' : ''} cursor-crosshair`}
        style={{
          left: `${baseX}px`,
          top: `${baseY}px`,
          zIndex: textElement.zIndex,
          fontSize: `${textElement.fontSize}px`,
          color: textElement.color,
          fontFamily: textElement.fontFamily,
          fontWeight: textElement.fontWeight,
          fontStyle: textElement.isItalic ? 'italic' : 'normal',
          textDecoration: textElement.isUnderlined ? 'underline' : 'none',
          textAlign: textElement.textAlign,
          padding: '4px',
          transform: 'translate(-50%, -50%)', // Center at the starting point
          pointerEvents: 'all', 
          userSelect: 'none',
          whiteSpace: 'nowrap',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          e.stopPropagation();
          selectTextElement(textElement.id);
          
          // Start path drawing with touch
          if (e.touches.length > 0) {
            const touch = e.touches[0];
            
            // Add initial point if needed
            if (textElement.path.length === 0) {
              addPathPoint(textElement.id, { 
                x: textElement.position.x, 
                y: textElement.position.y 
              });
            }
            
            // Add touch point
            if (e.touches[0]) {
              const touchX = touch.clientX;
              const touchY = touch.clientY;
              
              const lastPoint = textElement.path[textElement.path.length - 1];
              if (!lastPoint || distance({ x: touchX, y: touchY }, lastPoint) > 5) {
                addPathPoint(textElement.id, { x: touchX, y: touchY });
              }
            }
          }
        }}
      >
        {textElement.text}
        {textElement.isSelected && (
          <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-violet-200 font-semibold whitespace-nowrap w-40 -ml-16">
            Drag to create repeating text
          </div>
        )}
      </div>
    );
  }
  
  // Create the grid of repeated elements for multi-element case
  const elements = [];
  
  // Create the grid of repeated elements
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip if we've rendered enough elements
      if (row * cols + col >= repetitionCount) break;
      
      // Calculate position offset from base position
      const xOffset = col * horizontalSpacing;
      const yOffset = row * verticalSpacing;
      
      const isMainElement = row === 0 && col === 0;
      
      elements.push(
        <div
          key={`repeat-${row}-${col}`}
          className={`absolute select-none ${textElement.isSelected && isMainElement ? 'ring-2 ring-violet-500 animate-glow' : ''} cursor-crosshair`}
          style={{
            left: `${baseX + xOffset}px`,
            top: `${baseY + yOffset}px`,
            zIndex: textElement.zIndex,
            fontSize: `${textElement.fontSize}px`,
            color: textElement.color,
            fontFamily: textElement.fontFamily,
            fontWeight: textElement.fontWeight,
            fontStyle: textElement.isItalic ? 'italic' : 'normal',
            textDecoration: textElement.isUnderlined ? 'underline' : 'none',
            textAlign: textElement.textAlign,
            padding: '4px',
            transform: 'translate(-50%, -50%)', // Center at the starting point
            pointerEvents: isMainElement ? 'all' : 'none', // Only main element is clickable for performance
            userSelect: 'none',
            whiteSpace: 'nowrap',
            opacity: isMainElement ? 1 : 0.9, // Make repeated elements slightly transparent
            touchAction: isMainElement ? 'none' : 'auto',
          }}
          onMouseDown={isMainElement ? handleMouseDown : undefined}
          onTouchStart={isMainElement ? (e) => {
            e.stopPropagation();
            selectTextElement(textElement.id);
            
            // Start path drawing
            if (e.touches.length > 0) {
              const touch = e.touches[0];
              
              // Add initial point if needed
              if (textElement.path.length === 0) {
                addPathPoint(textElement.id, { 
                  x: textElement.position.x, 
                  y: textElement.position.y 
                });
              }
              
              // Add touch point
              if (e.touches[0]) {
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                const lastPoint = textElement.path[textElement.path.length - 1];
                if (!lastPoint || distance({ x: touchX, y: touchY }, lastPoint) > 5) {
                  addPathPoint(textElement.id, { x: touchX, y: touchY });
                }
              }
            }
          } : undefined}
        >
          {textElement.text}
          
          {/* Show guidance only on the main element */}
          {textElement.isSelected && isMainElement && (
            <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-violet-200 font-semibold whitespace-nowrap w-40 -ml-16">
              Continue dragging to create more repetitions
            </div>
          )}
        </div>
      );
    }
  }
  
  return <>{elements}</>;
}
