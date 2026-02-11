import { MousePointer2, Shapes, Share2 } from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    number: "01",
    title: "Click to Start",
    description: "No sign-up required. Just open the app and start drawing immediately.",
  },
  {
    icon: Shapes,
    title: "Create & Design",
    number: "02",
    description: "Use rectangles, arrows, text, and freehand tools to bring your ideas to life.",
  },
  {
    icon: Share2,
    title: "Share & Collaborate",
    number: "03",
    description: "Share a link with your team or export your work anywhere.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get started in seconds, not hours.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="relative z-10 bg-background p-4 inline-block">
                  <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 border-2 border-border shadow-sketch">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="font-display text-6xl font-bold text-muted/50 absolute -top-4 left-1/2 -translate-x-1/2">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-bold mb-3 relative z-10">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
