import { PushUniversalAccountButton } from '@pushchain/ui-kit';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Push Names
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#search" className="transition-colors hover:text-primary">
            Search
          </a>
          <a href="#register" className="transition-colors hover:text-primary">
            Register
          </a>
          <a href="#my-names" className="transition-colors hover:text-primary">
            My Names
          </a>
        </nav>

        <div>
          <PushUniversalAccountButton />
        </div>
      </div>
    </header>
  );
};
