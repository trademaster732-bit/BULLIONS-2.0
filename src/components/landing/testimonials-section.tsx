'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "This bot has completely changed my trading strategy. The accuracy is unmatched and the dynamic stop loss has saved me from so many bad trades.",
    name: 'John D.',
    role: 'Full-time Trader',
    avatar: '1',
  },
  {
    quote: "As someone new to trading, GoldenEye gave me the confidence to start. The signals are easy to follow and have been consistently profitable for me.",
    name: 'Sarah L.',
    role: 'Part-time Investor',
    avatar: '2',
  },
  {
    quote: "The multi-layered analysis is what sets this apart. It's not just another RSI bot. It genuinely understands market context. Highly recommended.",
    name: 'Mike R.',
    role: 'Forex Analyst',
    avatar: '3',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-gray-900/50 py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Traders <span className="text-primary">Worldwide</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Don't just take our word for it. Here's what our users are saying.
          </p>
        </motion.div>
        
        <div className="mx-auto mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="flex h-full flex-col border-primary/20 bg-black/30 text-white">
                <CardContent className="flex flex-col p-6">
                  <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                  </div>
                  <p className="mt-4 flex-1 text-gray-300">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center gap-4">
                    <Image
                      className="h-12 w-12 rounded-full object-cover"
                      src={`https://picsum.photos/seed/${testimonial.avatar}/100/100`}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      data-ai-hint="person portrait"
                    />
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
