export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-violet-500/20 bg-background/80 backdrop-blur-md py-4">
      <div className="container flex flex-col md:flex-row items-center justify-between px-4 md:px-6 text-sm text-muted-foreground">
        <p>© {currentYear} TextOverlay. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
} 