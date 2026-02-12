'use client';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How accurate are the signals?',
    answer: 'Our AI signals have historically maintained over 80% accuracy in identifying profitable TP1 (Take Profit 1) levels. However, market conditions vary, and past performance is not indicative of future results. We encourage responsible trading.',
  },
  {
    question: 'Is this bot fully automated?',
    answer: 'No, BULLIONS BOT is a signal provider, not an automated trading bot. It provides you with high-quality analysis and clear entry/exit points, but you retain full control and must execute the trades yourself through your preferred broker.',
  },
  {
    question: 'What do I need to get started?',
    answer: 'All you need is an account with a broker that trades XAU/USD (Gold). Our platform is web-based, so it runs on any desktop or mobile browser. No downloads or complex setup required.',
  },
  {
    question: 'How does the free trial work?',
    answer: 'After signing up for a free account, you can request a 7-day free trial of our Premium features. This gives you full access to everything our paid subscribers get, allowing you to see the value for yourself before committing.',
  },
    {
    question: 'What if I want to cancel my subscription?',
    answer: 'You can cancel your subscription at any time, no questions asked. Since payments are handled manually via crypto, your access will simply expire at the end of your current billing period.',
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-black py-20 sm:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-b-primary/20">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
