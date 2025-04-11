"use client";

import { createContext, ReactNode, useContext, useState } from "react";

// Path point interface
export interface PathPoint {
  x: number;
  y: number;
}

// Combined TextElement type - all text elements can optionally have path data
export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number }; // Initial position before path is drawn
  zIndex: number;
  isSelected: boolean;
  fontSize: number;
  color: string;
  // Path data
  path: PathPoint[];
  pathClosed: boolean;
  spaceBetween: number; // Word spacing for path
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
      path: [], // Start with an empty path
      pathClosed: false,
      spaceBetween: 5,
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
