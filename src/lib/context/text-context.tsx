"use client";

import { createContext, ReactNode, useContext, useState } from "react";

// Path point interface
export interface PathPoint {
  x: number;
  y: number;
}

// Repetition direction type
export type RepetitionDirection = "horizontal" | "vertical" | "both";

// Combined TextElement type - all text elements can optionally have path data
export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number }; // Initial position before path is drawn
  zIndex: number;
  isSelected: boolean;
  fontSize: number;
  color: string;
  // New styling properties
  fontFamily: string;
  fontWeight: string;
  isItalic: boolean;
  isUnderlined: boolean;
  textAlign: "left" | "center" | "right";
  // Path data
  path: PathPoint[];
  pathClosed: boolean;
  spaceBetween: number; // Word spacing for path
  // Repetition properties
  isRepeating: boolean;
  repetitionCount: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  repetitionDirection: RepetitionDirection;
}

// Define the context type
interface TextContextType {
  textElements: TextElement[];
  addTextElement: (text: string) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  removeTextElement: (id: string) => void;
  selectTextElement: (id: string | null) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  addPathPoint: (id: string, point: PathPoint) => void;
  clearPathPoints: (id: string) => void;
  togglePathClosed: (id: string) => void;
  updateSpaceBetween: (id: string, value: number) => void;
  selectedTextElementId: string | null;
  copyStylesFrom: (sourceId: string, targetId: string) => void;
  // Repetition functions
  toggleRepetition: (id: string) => void;
  updateRepetitionCount: (id: string, count: number) => void;
  updateHorizontalSpacing: (id: string, spacing: number) => void;
  updateVerticalSpacing: (id: string, spacing: number) => void;
  updateRepetitionDirection: (id: string, direction: RepetitionDirection) => void;
}

// Create the context with a default value
const TextContext = createContext<TextContextType | undefined>(undefined);

// Provider component
export function TextProvider({ children }: { children: ReactNode }) {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(null);

  // Add a new text element
  const addTextElement = (text: string) => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text,
      position: { x: 50, y: 50 }, // Default initial position
      zIndex: textElements.length + 1,
      isSelected: true,
      fontSize: 20,
      color: "#FFFFFF",
      // New styling defaults
      fontFamily: "Inter",
      fontWeight: "normal",
      isItalic: false,
      isUnderlined: false,
      textAlign: "center",
      path: [], // Start with an empty path
      pathClosed: false,
      spaceBetween: 5,
      // Repetition defaults - automatic repetition enabled by default
      isRepeating: true,
      repetitionCount: 3,
      horizontalSpacing: 20,
      verticalSpacing: 20,
      repetitionDirection: "horizontal",
    };

    // Unselect previous elements and select the new one
    setTextElements([
      ...textElements.map(el => ({ ...el, isSelected: false })),
      newElement,
    ]);
    setSelectedTextElementId(newElement.id);
  };

  // Update an existing text element
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(
      textElements.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Remove a text element
  const removeTextElement = (id: string) => {
    setTextElements(textElements.filter(el => el.id !== id));
    if (selectedTextElementId === id) {
      setSelectedTextElementId(null);
    }
  };

  // Select a text element
  const selectTextElement = (id: string | null) => {
    setTextElements(
      textElements.map(el => ({
        ...el,
        isSelected: el.id === id,
      }))
    );
    setSelectedTextElementId(id);
  };

  // Move a text element forward (increase z-index)
  const moveForward = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    const maxZIndex = Math.max(...textElements.map(el => el.zIndex));
    updateTextElement(id, { zIndex: maxZIndex + 1 });
  };

  // Move a text element backward (decrease z-index)
  const moveBackward = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    const minZIndex = Math.min(...textElements.map(el => el.zIndex));
    if (element.zIndex > minZIndex) {
      updateTextElement(id, { zIndex: minZIndex - 1 });
    }
  };

  // Add a point to a path
  const addPathPoint = (id: string, point: PathPoint) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      path: [...element.path, point]
    });
  };

  // Clear all points from a path
  const clearPathPoints = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      path: []
    });
  };

  // Toggle path closed state (open or closed path)
  const togglePathClosed = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      pathClosed: !element.pathClosed
    });
  };

  // Update space between repeated text
  const updateSpaceBetween = (id: string, value: number) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      spaceBetween: value
    });
  };

  // Toggle text repetition
  const toggleRepetition = (id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      isRepeating: !element.isRepeating
    });
  };

  // Update repetition count
  const updateRepetitionCount = (id: string, count: number) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      repetitionCount: count
    });
  };

  // Update horizontal spacing
  const updateHorizontalSpacing = (id: string, spacing: number) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      horizontalSpacing: spacing
    });
  };

  // Update vertical spacing
  const updateVerticalSpacing = (id: string, spacing: number) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      verticalSpacing: spacing
    });
  };

  // Update repetition direction
  const updateRepetitionDirection = (id: string, direction: RepetitionDirection) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    updateTextElement(id, {
      repetitionDirection: direction
    });
  };

  // Add new function to copy styles between text elements
  const copyStylesFrom = (sourceId: string, targetId: string) => {
    const sourceElement = textElements.find(el => el.id === sourceId);
    const targetElement = textElements.find(el => el.id === targetId);
    
    if (!sourceElement || !targetElement) return;
    
    updateTextElement(targetId, {
      fontSize: sourceElement.fontSize,
      color: sourceElement.color,
      fontFamily: sourceElement.fontFamily,
      fontWeight: sourceElement.fontWeight,
      isItalic: sourceElement.isItalic,
      isUnderlined: sourceElement.isUnderlined,
      textAlign: sourceElement.textAlign,
      spaceBetween: sourceElement.spaceBetween,
      // Also copy repetition settings
      isRepeating: sourceElement.isRepeating,
      repetitionCount: sourceElement.repetitionCount,
      horizontalSpacing: sourceElement.horizontalSpacing,
      verticalSpacing: sourceElement.verticalSpacing,
      repetitionDirection: sourceElement.repetitionDirection,
    });
  };

  return (
    <TextContext.Provider
      value={{
        textElements,
        addTextElement,
        updateTextElement,
        removeTextElement,
        selectTextElement,
        moveForward,
        moveBackward,
        addPathPoint,
        clearPathPoints,
        togglePathClosed,
        updateSpaceBetween,
        selectedTextElementId,
        copyStylesFrom,
        // Repetition functions
        toggleRepetition,
        updateRepetitionCount,
        updateHorizontalSpacing,
        updateVerticalSpacing,
        updateRepetitionDirection,
      }}
    >
      {children}
    </TextContext.Provider>
  );
}

// Custom hook to use the text context
export function useText() {
  const context = useContext(TextContext);
  
  if (context === undefined) {
    throw new Error("useText must be used within a TextProvider");
  }
  
  return context;
}
