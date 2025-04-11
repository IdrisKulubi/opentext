"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, or WebP).",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Read the file and store it in browser storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        
        // Store in localStorage
        const timestamp = Date.now();
        const key = `image_${timestamp}`;
        localStorage.setItem(key, imageDataUrl);
        
        // Call the callback with the key as the URL
        onImageUpload(key);
        
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "An error occurred while reading the image file.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={cn(
        "w-full h-64 flex flex-col items-center justify-center p-6 border-dashed transition-all duration-200 card-futuristic",
        isDragging ? "border-violet-500 bg-violet-500/5" : "border-border",
        isUploading ? "opacity-70 pointer-events-none" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="size-16 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center animate-float">
          <ImageIcon className="size-8 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Upload your image</h3>
          <p className="text-sm text-muted-foreground max-w-[15rem]">
            Drag and drop your image, or click to browse
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button 
          onClick={handleButtonClick} 
          disabled={isUploading} 
          className="glow-effect"
        >
          <Upload className="mr-2 size-4" />
          Upload Image
        </Button>
      </div>
    </Card>
  );
} 