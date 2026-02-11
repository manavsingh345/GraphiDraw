import { Button } from "@repo/ui/Bigbutton"
import { ArrowRight, Pencil } from "lucide-react";
import Link from "next/link"
const CTA = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="relative bg-foreground text-background rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute top-6 left-6 w-12 h-12 border-2 border-background/20 rounded-lg rotate-12" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-background/20 rounded-full" />
          <div className="absolute top-1/2 right-12 w-8 h-8 bg-primary/30 rounded-lg -rotate-6 hidden md:block" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Pencil className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Ready to start sketching?
            </h2>
            <p className="text-lg text-background/70 max-w-xl mx-auto mb-8">
              Join thousands of teams who use Sketchboard to visualize ideas and collaborate in real-time.
            </p>
            
            <Link href="/signup">
            <Button variant="hero" size="xl" className="bg-background text-foreground hover:bg-background/90 w-50 cursor-pointer">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
