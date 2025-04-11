/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useText } from "@/lib/context/text-context";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  DownloadIcon, 
  ClipboardCopyIcon, 
  ImageIcon
} from "lucide-react";
import { 
  renderCanvasToDataURL, 
  copyImageToClipboard, 
  generateFilename, 
  downloadDataUrl
} from "@/lib/utils";
import { toast } from "sonner";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageKey: string | null;
}

export function ExportModal({ open, onOpenChange, imageKey }: ExportModalProps) {
  const { textElements } = useText();
  
  // Image export settings
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(0.9);
  const [filename, setFilename] = useState('text-overlay');
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [preserveTransparency, setPreserveTransparency] = useState(true);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Rendered image
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  
  // Initialize filename when modal opens
  useEffect(() => {
    if (open) {
      setFilename(`text-overlay-${new Date().toISOString().split('T')[0]}`);
      renderImage();
    } else {
      // Clear data when modal closes
      setRenderedImage(null);
    }
  }, [open]);
  
  // When format changes, update filename extension
  useEffect(() => {
    if (filename) {
      const baseName = filename.split('.')[0];
      setFilename(`${baseName}.${format}`);
    }
  }, [format]);
  
  // When format changes and it's JPEG, disable transparency
  useEffect(() => {
    if (format === 'jpeg') {
      setPreserveTransparency(false);
    }
  }, [format]);
  
  // Render the image with current settings
  const renderImage = async () => {
    if (!imageKey) return;
    
    setIsProcessing(true);
    
    try {
      // Get image from localStorage
      const imageSrc = localStorage.getItem(imageKey);
      
      if (!imageSrc) {
        throw new Error('Image not found');
      }
      
      // Render the image with text overlays
      const dataUrl = await renderCanvasToDataURL(
        imageSrc,
        textElements,
        format === 'png' ? 'image/png' : 'image/jpeg',
        quality
      );
      
      setRenderedImage(dataUrl);
    } catch (error) {
      console.error('Error rendering image:', error);
      toast.error("There was a problem generating your image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Re-render image when settings change
  useEffect(() => {
    if (open && imageKey) {
      const debounce = setTimeout(() => {
        renderImage();
      }, 500);
      
      return () => clearTimeout(debounce);
    }
  }, [format, quality, includeWatermark, textElements, open, imageKey]);
  
  // Handle format change
  const handleFormatChange = (value: string) => {
    setFormat(value as 'png' | 'jpeg');
    
    // If changing to JPEG, disable transparency
    if (value === 'jpeg') {
      setPreserveTransparency(false);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (!renderedImage) {
      toast.error("Please wait for the image to render before downloading.");
      return;
    }
    
    try {
      downloadDataUrl(renderedImage, filename || generateFilename(format));
      
      toast.success("Your image is being downloaded.");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("There was a problem downloading the image. Please try again.");
    }
  };
  
  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!renderedImage) {
      toast.error("Please wait for the image to render before copying.");
      return;
    }
    
    setIsCopying(true);
    
    try {
      const success = await copyImageToClipboard(renderedImage);
      
      if (success) {
        toast.success("Image successfully copied to clipboard.");
      } else {
        throw new Error('Copy operation failed');
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error("There was a problem copying the image. Try a different browser or download instead.");
    } finally {
      setIsCopying(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Customize export settings and download or copy your design.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="mt-5">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <ImageIcon className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="p-1">
            <div className="border rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] bg-gray-900/10 dark:bg-gray-800/20">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="size-10 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Rendering image...</p>
                </div>
              ) : renderedImage ? (
                <img 
                  src={renderedImage} 
                  alt="Exported design" 
                  className="max-w-full max-h-[300px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="size-10 text-gray-400" />
                  <p className="text-sm text-muted-foreground mt-2">Preview not available</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Button
                onClick={handleDownload}
                disabled={isProcessing || !renderedImage}
                className="flex items-center gap-1"
              >
                <DownloadIcon className="size-4" />
                Download
              </Button>
              
              <Button
                onClick={handleCopyToClipboard}
                disabled={isProcessing || !renderedImage || isCopying}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {isCopying ? (
                  <>
                    <div className="size-4 border-2 border-t-current border-current/20 rounded-full animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <ClipboardCopyIcon className="size-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="format">File Format</Label>
              <RadioGroup
                id="format"
                value={format}
                onValueChange={handleFormatChange}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="format-png" />
                  <Label htmlFor="format-png" className="cursor-pointer">PNG</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpeg" id="format-jpeg" />
                  <Label htmlFor="format-jpeg" className="cursor-pointer">JPEG</Label>
                </div>
              </RadioGroup>
              
              <div className="text-xs text-muted-foreground mt-1">
                {format === 'png' 
                  ? 'PNG maintains transparency and offers better quality, but may have larger file sizes.'
                  : 'JPEG is smaller in size but does not support transparency.'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="quality">Quality: {Math.round(quality * 100)}%</Label>
              </div>
              <Slider
                id="quality"
                value={[quality * 100]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value) => setQuality(value[0] / 100)}
              />
              <div className="text-xs text-muted-foreground">
                Higher quality results in larger file sizes.
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => {
                  // Extract base name without extension
                  const baseName = e.target.value.split('.')[0];
                  if (baseName) {
                    setFilename(`${baseName}.${format}`);
                  }
                }}
                placeholder="e.g., my-design"
                className="font-mono text-sm"
              />
            </div>
            
            {format === 'png' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="preserve-transparency"
                  checked={preserveTransparency}
                  onCheckedChange={setPreserveTransparency}
                />
                <Label htmlFor="preserve-transparency" className="cursor-pointer">
                  Preserve transparency
                </Label>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="watermark"
                checked={includeWatermark}
                onCheckedChange={setIncludeWatermark}
              />
              <Label htmlFor="watermark" className="cursor-pointer">
                Include watermark
              </Label>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={renderImage} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="size-4 border-2 border-t-current border-current/20 rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Update Preview'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isProcessing || !renderedImage}
            className="w-full sm:w-auto"
          >
            <DownloadIcon className="size-4 mr-2" />
            Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 