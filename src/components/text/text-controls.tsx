"use client";

import { useState } from "react";
import { useText } from "@/lib/context/text-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Type, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Circle,
} from "lucide-react";

export function TextControls() {
  const { 
    textElements, 
    addTextElement, 
    updateTextElement, 
    removeTextElement, 
    selectedTextElementId,
    moveForward,
    moveBackward,
    clearPathPoints,
    togglePathClosed,
    updateSpaceBetween
  } = useText();
  
  const [newText, setNewText] = useState("");
  
  const selectedElement = textElements.find(
    (el) => el.id === selectedTextElementId
  );

  const handleAddText = () => {
    if (newText.trim()) {
      addTextElement(newText.trim());
      setNewText("");
    }
  };

  return (
    <Card className="card-futuristic">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter text..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddText} className="glow-effect">
            <Type className="mr-2 size-4" />
            Add Text
          </Button>
        </div>

        {selectedElement && (
          <div className="space-y-4 mt-4 pt-4 border-t border-violet-500/20">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Edit Text</h3>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveForward(selectedElement.id)}
                  title="Bring Forward"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveBackward(selectedElement.id)}
                  title="Send Backward"
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeTextElement(selectedElement.id)}
                  className="text-destructive"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="text-content" className="text-xs">Text Content</Label>
                <Input
                  id="text-content"
                  value={selectedElement.text}
                  onChange={(e) => updateTextElement(selectedElement.id, { text: e.target.value })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="font-size" className="text-xs">Font Size: {selectedElement.fontSize}px</Label>
                </div>
                <Slider
                  id="font-size"
                  min={8}
                  max={72}
                  step={1}
                  value={[selectedElement.fontSize]}
                  onValueChange={(value) => updateTextElement(selectedElement.id, { fontSize: value[0] })}
                />
              </div>

              <div>
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateTextElement(selectedElement.id, { color: e.target.value })}
                    className="w-12 h-8 p-0 overflow-hidden"
                  />
                  <Input
                    value={selectedElement.color}
                    onChange={(e) => updateTextElement(selectedElement.id, { color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Path-specific controls */}
              {selectedElement.path.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-violet-500/20">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="path-closed" className="text-xs">Closed Path</Label>
                    <Switch
                      id="path-closed"
                      checked={selectedElement.pathClosed}
                      onCheckedChange={() => togglePathClosed(selectedElement.id)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="space-between" className="text-xs">
                        Word Spacing: {selectedElement.spaceBetween}px
                      </Label>
                    </div>
                    <Slider
                      id="space-between"
                      min={0}
                      max={50}
                      step={1}
                      value={[selectedElement.spaceBetween]}
                      onValueChange={(value) => updateSpaceBetween(selectedElement.id, value[0])}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => clearPathPoints(selectedElement.id)}
                    className="w-full mt-2"
                  >
                    <Circle className="mr-2 size-4" />
                    Clear Path
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
