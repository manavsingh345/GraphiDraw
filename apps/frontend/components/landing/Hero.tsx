import { Button } from "@repo/ui/Bigbutton"
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import heroImage from "@/public/hero-whiteboard.png";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-6 border-2 border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Free to use, forever</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Sketch your ideas,
            <br />
            <span className="hand-drawn-underline">together</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A virtual whiteboard for sketching hand-drawn like diagrams. 
            Collaborate in real-time, export anywhere, and bring your ideas to life.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Start Drawing
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="xl">
              Watch Demo
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border-2 border-foreground/10 shadow-sketch-hover animate-float">
            <Image 
              src={heroImage}
              alt="Sketchboard interface showing hand-drawn diagrams"
              className="w-full h-auto"
            />
          </div>
          
          <div className="absolute -left-8 top-1/4 w-16 h-16 border-2 border-primary/30 rounded-lg rotate-12 hidden lg:block" />
          <div className="absolute -right-4 top-1/3 w-12 h-12 bg-accent/20 rounded-full hidden lg:block" />
          <div className="absolute -right-8 bottom-1/4 w-20 h-20 border-2 border-accent/30 rounded-lg -rotate-6 hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
