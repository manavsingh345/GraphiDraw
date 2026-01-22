import { Pencil } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Pencil className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Sketchboard</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © 2024 Sketchboard. Made with ♥
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
