import AuthForm from '@/components/auth-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]"></div>
      <div className="relative z-10 w-full max-w-md space-y-6">
        <header className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="BULLIONS BOT Logo" width={240} height={60} />
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
                Welcome back, trader. Your seat at the terminal is ready.
            </p>
        </header>
        <AuthForm />
      </div>
    </main>
  );
}
