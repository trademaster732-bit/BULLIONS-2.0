
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Users, Target, BrainCircuit } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">About BULLIONS BOT</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Democratizing professional-grade trading tools for every gold trader.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-invert text-gray-300 leading-loose max-w-none">
                <h2 className="font-serif text-3xl text-white">Our Mission</h2>
                <p>
                    In the fast-paced world of forex and commodities trading, retail traders are often at a disadvantage. Lacking access to the sophisticated data analysis and AI-driven tools used by large institutions, they are left to navigate volatile markets with limited resources. BULLIONS BOT was founded to close this gap.
                </p>
                <p>
                    Our mission is simple: to provide retail traders with powerful, data-driven, and easy-to-use tools that were once the exclusive domain of professional trading desks. We believe that by leveraging the power of artificial intelligence, we can help you make smarter, more informed decisions in the gold market.
                </p>
                <h2 className="font-serif text-3xl text-white mt-8">Our Philosophy</h2>
                <p>
                    We are built on the principle of "Data, Not Drama." Trading should be a discipline, not a gamble. Our AI analyzes millions of data points—from price action and volatility to market sentiment and historical trends—to deliver signals that are objective and free from human emotional bias. We handle the complex analysis so you can focus on execution.
                </p>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
                <Image src="https://picsum.photos/seed/about/800/600" alt="Team working on charts" layout="fill" objectFit="cover" data-ai-hint="trading charts" />
            </div>
        </div>

        <div className="my-24">
            <h2 className="font-serif text-3xl text-white text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 border border-primary/20 rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold text-xl text-white">Trader-Centric</h3>
                    <p className="text-gray-400 mt-2">Every feature we build is designed with the retail trader in mind—intuitive, powerful, and accessible.</p>
                </div>
                <div className="text-center p-6 border border-primary/20 rounded-lg">
                    <Target className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold text-xl text-white">Accuracy & Transparency</h3>
                    <p className="text-gray-400 mt-2">We strive for the highest accuracy while being transparent about the risks. Past performance is available for review.</p>
                </div>
                <div className="text-center p-6 border border-primary/20 rounded-lg">
                    <BrainCircuit className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold text-xl text-white">Continuous Innovation</h3>
                    <p className="text-gray-400 mt-2">The markets evolve, and so do we. We are constantly refining our AI models to stay ahead of market trends.</p>
                </div>
            </div>
        </div>

      </main>
      <LandingFooter />
    </div>
  );
}
