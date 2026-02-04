import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Background image placeholder for consistency with the Welcome screen pattern
  const bgImg = "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000";

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please enter both email/phone and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(identifier, password);
      if (result.success) {
        navigate('/chats');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col lg:flex-row bg-ivory overflow-hidden transition-all duration-300">
      {/* Visual Side Panel (Hidden on small mobile if needed, or stays at top) */}
      <div className="relative h-[20vh] md:h-[25vh] lg:h-full lg:w-1/2 overflow-hidden bg-charcoal">
        <div 
          className="h-full w-full bg-cover bg-center grayscale-[20%] opacity-60" 
          style={{ backgroundImage: `url("${bgImg}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ivory lg:hidden" />
      </div>

      {/* Form Content Side */}
      <div className="relative flex flex-1 flex-col h-full lg:w-1/2 overflow-y-auto">
        {/* Navigation - Original Style */}
        <nav className="flex items-center pt-6 md:pt-8 lg:pt-12 px-6 md:px-12">
          <button 
            onClick={() => navigate('/')}
            className="text-charcoal flex size-10 md:size-12 items-center justify-start hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
          </button>
        </nav>

        <div className="flex flex-1 flex-col justify-center max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full px-6 md:px-12">
          {/* Header - Original Style */}
          <header className="pb-6 md:pb-10">
            <h1 className="tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-tight serif-italic text-charcoal">
              Welcome back
            </h1>
            <p className="text-charcoal/60 text-xs md:text-sm lg:text-base font-display mt-2 md:mt-3 uppercase tracking-[0.2em]">
              Sign in to continue
            </p>
          </header>

          {/* Error Message - Original Style */}
          {error && (
            <div className="mb-6 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-600 text-sm md:text-base">{error}</p>
            </div>
          )}

          {/* Form Area - Original Style Boxed Inputs */}
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 py-4">
            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">
                Email or Mobile Number
              </p>
              <input 
                className="flex w-full rounded-lg text-charcoal border border-charcoal/10 bg-white/50 h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" 
                placeholder="e.g. name@email.com" 
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              />
            </div>
            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">
                Password
              </p>
              <input 
                className="flex w-full rounded-lg text-charcoal border border-charcoal/10 bg-white/50 h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" 
                placeholder="Enter your password" 
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {/* Terms - Original Style */}
          <div className="mt-4 md:mt-6">
            <p className="text-charcoal/40 text-[11px] md:text-xs lg:text-sm font-sans leading-relaxed">
              By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

          {/* Action - Original Style Button */}
          <div className="mt-6 md:mt-8 lg:mt-10">
            <button 
              disabled={!identifier || !password || isLoading}
              onClick={handleLogin}
              className="w-full bg-charcoal text-ivory h-12 md:h-14 lg:h-16 rounded-lg font-display font-bold text-base md:text-lg lg:text-xl hover:opacity-90 transition-opacity shadow-lg shadow-charcoal/10 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Continue'}
            </button>
          </div>

          {/* Footer - Original Style */}
          <div className="mt-8 pb-10 flex flex-col items-center md:items-start">
            <button className="text-charcoal/70 text-sm md:text-base font-medium hover:underline font-display">
              Forgot details?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
