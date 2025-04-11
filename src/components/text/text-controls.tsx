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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Type, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Circle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Paintbrush,
} from "lucide-react";

// Font options available in the app
const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

// Font weight options
const fontWeightOptions = [
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" },
  { value: "lighter", label: "Light" },
];

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
    updateSpaceBetween,
    copyStylesFrom,
  } = useText();
  
  const [newText, setNewText] = useState("");
  const [copiedStylesFrom, setCopiedStylesFrom] = useState<string | null>(null);
  
  const selectedElement = textElements.find(
    (el) => el.id === selectedTextElementId
  );

  const handleAddText = () => {
    if (newText.trim()) {
      addTextElement(newText.trim());
      setNewText("");
    }
  };

  const handleCopyStyles = (sourceId: string) => {
    setCopiedStylesFrom(sourceId);
  };

  const handleApplyStyles = (targetId: string) => {
    if (copiedStylesFrom) {
      copyStylesFrom(copiedStylesFrom, targetId);
      setCopiedStylesFrom(null);
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
          <Accordion type="single" collapsible defaultValue="edit-text" className="w-full">
            <AccordionItem value="edit-text" className="border-b border-violet-500/20">
              <div className="flex justify-between items-center w-full">
                <AccordionTrigger className="hover:text-violet-400 py-2 flex-1">
                  <h3 className="text-sm font-medium">Edit Text</h3>
                </AccordionTrigger>
                <div className="flex space-x-1 py-2 pr-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveForward(selectedElement.id)}
                    title="Bring Forward"
                    className="h-7 w-7"
                  >
                    <ChevronUp className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveBackward(selectedElement.id)}
                    title="Send Backward"
                    className="h-7 w-7"
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTextElement(selectedElement.id)}
                    className="text-destructive h-7 w-7"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="space-y-3 pb-2">
                <div>
                  <Label htmlFor="text-content" className="text-xs">Text Content</Label>
                  <Input
                    id="text-content"
                    value={selectedElement.text}
                    onChange={(e) => updateTextElement(selectedElement.id, { text: e.target.value })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="text-styling" className="border-b border-violet-500/20">
              <AccordionTrigger className="hover:text-violet-400 py-2">
                <div className="flex items-center">
                  <Paintbrush className="mr-2 size-4" />
                  <h3 className="text-sm font-medium">Text Styling</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-2">
                {/* Font Family Selection */}
                <div>
                  <Label htmlFor="font-family" className="text-xs mb-1 block">Font Family</Label>
                  <Select
                    value={selectedElement.fontFamily}
                    onValueChange={(value) => updateTextElement(selectedElement.id, { fontFamily: value })}
                  >
                    <SelectTrigger id="font-family" className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Weight Selection */}
                <div>
                  <Label htmlFor="font-weight" className="text-xs mb-1 block">Font Weight</Label>
                  <Select
                    value={selectedElement.fontWeight}
                    onValueChange={(value) => updateTextElement(selectedElement.id, { fontWeight: value })}
                  >
                    <SelectTrigger id="font-weight" className="w-full">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeightOptions.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size Slider */}
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

                {/* Text Color Picker */}
                <div>
                  <Label htmlFor="text-color" className="text-xs mb-1 block">Text Color</Label>
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

                {/* Text Style Toggles (Bold, Italic, Underline) */}
                <div>
                  <Label className="text-xs mb-2 block">Text Style</Label>
                  <div className="flex space-x-1">
                    <Toggle
                      aria-label="Toggle bold"
                      pressed={selectedElement.fontWeight === "bold"}
                      onPressedChange={(pressed) => 
                        updateTextElement(selectedElement.id, { fontWeight: pressed ? "bold" : "normal" })
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                      aria-label="Toggle italic"
                      pressed={selectedElement.isItalic}
                      onPressedChange={(pressed) => 
                        updateTextElement(selectedElement.id, { isItalic: pressed })
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                      aria-label="Toggle underline"
                      pressed={selectedElement.isUnderlined}
                      onPressedChange={(pressed) => 
                        updateTextElement(selectedElement.id, { isUnderlined: pressed })
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="h-4 w-4" />
                    </Toggle>
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <Label className="text-xs mb-2 block">Text Alignment</Label>
                  <ToggleGroup 
                    type="single" 
                    value={selectedElement.textAlign} 
                    onValueChange={(value) => {
                      if (value) updateTextElement(selectedElement.id, { textAlign: value as "left" | "center" | "right" });
                    }}
                    className="flex justify-start"
                  >
                    <ToggleGroupItem value="left" aria-label="Align left">
                      <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align center">
                      <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align right">
                      <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Path-specific controls */}
            {selectedElement.path.length > 0 && (
              <AccordionItem value="path-settings" className="border-b border-violet-500/20">
                <AccordionTrigger className="hover:text-violet-400 py-2">
                  <div className="flex items-center">
                    <Circle className="mr-2 size-4" />
                    <h3 className="text-sm font-medium">Path Settings</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-2">
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
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Style Copy Feature */}
            <AccordionItem value="style-copy" className="border-b border-violet-500/20">
              <AccordionTrigger className="hover:text-violet-400 py-2">
                <div className="flex items-center">
                  <Copy className="mr-2 size-4" />
                  <h3 className="text-sm font-medium">Copy Styles</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-2">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyStyles(selectedElement.id)}
                    className="w-full"
                  >
                    <Copy className="mr-2 size-4" />
                    Copy Current Styles
                  </Button>
                  
                  {copiedStylesFrom && (
                    <div className="text-center text-xs text-violet-400 animate-pulse">
                      Styles copied! Select another text to apply
                    </div>
                  )}

                  {textElements.length > 1 && (
                    <div className="mt-2">
                      <Label className="text-xs mb-2 block">Apply styles to:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {textElements
                          .filter(el => el.id !== selectedElement.id)
                          .map(el => (
                            <Button
                              key={el.id}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApplyStyles(el.id)}
                              className="text-xs truncate"
                              title={el.text}
                            >
                              <Paintbrush className="mr-1 size-3" />
                              {el.text.substring(0, 10)}{el.text.length > 10 ? '...' : ''}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
