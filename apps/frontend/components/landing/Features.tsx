import { Users, Zap, Download, Palette, Lock, Infinity } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time. See cursors, changes, and collaborate seamlessly.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No loading screens, no lag. Start drawing instantly with our optimized canvas engine.",
  },
  {
    icon: Palette,
    title: "Hand-drawn Style",
    description: "Beautiful, organic sketches that look like you drew them yourself. Perfect for presentations.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Export to PNG, SVG, or clipboard. Embed in Notion, Confluence, or any documentation tool.",
  },
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Your drawings are private by default. Only you and your team can see your work.",
  },
  {
    icon: Infinity,
    title: "Infinite Canvas",
    description: "Never run out of space. Zoom in, zoom out, and pan across your unlimited workspace.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need to sketch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple tools, powerful features. Focus on your ideas, not the software.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-card p-8 rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-sketch"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
