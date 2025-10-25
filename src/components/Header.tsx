import { PushUniversalAccountButton } from '@pushchain/ui-kit';
import PNSLogo from '../../public/PNS_Logo.png';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
          <img className='w-36' src={PNSLogo} alt="pnslogo" />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">
            Search
          </Link>
          <Link to="/" className="transition-colors hover:text-primary">
            Register
          </Link>
          <Link to="/my-names" className="transition-colors hover:text-primary">
            My Names
          </Link>
        </nav>

        <div>
          <PushUniversalAccountButton />
        </div>
      </div>
    </header>
  );
};
