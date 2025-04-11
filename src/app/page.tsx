"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ImageUpload } from "@/components/upload/image-upload";
import { ImageCanvas } from "@/components/canvas/image-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { PlusIcon, ImageIcon, SaveIcon } from "lucide-react";

export default function Home() {
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
  
  const handleImageUpload = (imageKey: string) => {
    setActiveImageKey(imageKey);
  };

  const handleSwitchToUpload = () => {
    const uploadTab = document.querySelector('[data-state="inactive"][value="upload"]') as HTMLElement;
    if (uploadTab) uploadTab.click();
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between pt-24 pb-16">
        <div className="container px-4 md:px-6 mx-auto space-y-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text text-center">
              Add Text to Your Images
            </h1>
            <p className="mt-3 text-center text-lg text-muted-foreground mx-auto max-w-3xl">
              Upload an image, add customizable text, and position it anywhere with a simple drag-and-drop interface.
            </p>
          </div>

          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="canvas" className="data-[state=active]:bg-violet-500/10">
                <ImageIcon className="size-4 mr-2" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-violet-500/10">
                <PlusIcon className="size-4 mr-2" />
                Upload New
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                {activeImageKey ? (
                  <ImageCanvas imageKey={activeImageKey} />
                ) : (
                  <Card className="card-futuristic">
                    <CardHeader>
                      <CardTitle>No Image Selected</CardTitle>
                      <CardDescription>
                        Upload an image to get started with your text overlay project.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <Button onClick={handleSwitchToUpload}>
                        Upload Image
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {activeImageKey && (
                  <div className="flex justify-end">
                    <Button variant="outline" className="mr-2" disabled>
                      <SaveIcon className="size-4 mr-2" />
                      Save
                    </Button>
                    <Button>
                      Export Image
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-0">
              <ImageUpload onImageUpload={handleImageUpload} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  );
} 
