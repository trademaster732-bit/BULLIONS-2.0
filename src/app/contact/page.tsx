
'use client';

import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We will get back to you shortly.",
        });

        // In a real application, you would clear the form here.
        setIsSubmitting(false);
    };

    return (
        <div className="bg-black text-white">
            <LandingHeader />
            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-primary mb-4">Contact Us</h1>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Have questions, feedback, or need support? We're here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="flex flex-col justify-center space-y-6">
                             <div>
                                <h3 className="font-semibold text-white text-xl flex items-center gap-2"><Mail />General Inquiries</h3>
                                <p className="text-gray-400 mt-2">For any general questions about our service, features, or partnerships.</p>
                                <a href="mailto:support@bullions.live" className="text-primary hover:underline mt-1 block">support@bullions.live</a>
                            </div>
                             <div>
                                <h3 className="font-semibold text-white text-xl flex items-center gap-2">Support</h3>
                                <p className="text-gray-400 mt-2">If you need technical assistance with your account or our signals.</p>
                                <a href="mailto:support@bullions.live" className="text-primary hover:underline mt-1 block">support@bullions.live</a>
                            </div>
                        </div>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your Name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="your.email@example.com" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="What is your message about?" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Your message..." required rows={5} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
