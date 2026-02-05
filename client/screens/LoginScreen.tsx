import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmailOrPhone } from '../utils/validation';
import { sanitizeEmail, sanitizePhoneNumber } from '../utils/sanitization';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Only show loading if loading is true AND no error is set
  const showLoading = isLoading && !error;

  // Background image placeholder for consistency with the Welcome screen pattern
  const bgImg = "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000";

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    setIdentifierError('');
    setPasswordError('');

    // Validate inputs - don't proceed if validation fails
    const identifierValidation = validateEmailOrPhone(identifier);
    if (!identifierValidation.isValid) {
      setIdentifierError(identifierValidation.error || 'Invalid email or phone number');
      setIsLoading(false); // Ensure loading is false
      return; // Return early, no loading state
    }

    if (!password || password.trim().length === 0) {
      setPasswordError('Password is required');
      setIsLoading(false); // Ensure loading is false
      return; // Return early, no loading state
    }

    // Sanitize inputs
    const sanitizedIdentifier = identifier.includes('@')
      ? sanitizeEmail(identifier)
      : sanitizePhoneNumber(identifier);
    const sanitizedPassword = password.trim();

    // Only set loading state after validation passes
    setIsLoading(true);
    // Clear any previous errors when starting login
    setError('');

    try {
      const result = await login(sanitizedIdentifier, sanitizedPassword);
      
      if (result.success) {
        // Clear loading on success before navigation
        setIsLoading(false);
        navigate('/chats');
        return; // Exit early on success
      }
      
      // If not successful, clear loading and show error message immediately
      setIsLoading(false);
      const errorMessage = result.error || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      console.log('Login failed, error:', errorMessage);
    } catch (err) {
      // Clear loading immediately on error
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
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
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 transition-all outline-none ${
                  identifierError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white/50 focus:ring-primary focus:border-primary'
                }`}
                placeholder="e.g. name@email.com" 
                type="text"
                value={identifier}
                onChange={(e) => { 
                  setIdentifier(e.target.value); 
                  setError(''); 
                  setIdentifierError('');
                }}
                onBlur={() => {
                  if (identifier.trim()) {
                    const validation = validateEmailOrPhone(identifier);
                    if (!validation.isValid) {
                      setIdentifierError(validation.error || '');
                    }
                  }
                }}
              />
              {identifierError && (
                <p className="text-red-500 text-xs mt-1 px-1">{identifierError}</p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">
                Password
              </p>
              <input 
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 transition-all outline-none ${
                  passwordError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white/50 focus:ring-primary focus:border-primary'
                }`}
                placeholder="Enter your password" 
                type="password"
                value={password}
                onChange={(e) => { 
                  setPassword(e.target.value); 
                  setError(''); 
                  setPasswordError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 px-1">{passwordError}</p>
              )}
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
              disabled={!identifier || !password || showLoading}
              onClick={handleLogin}
              className="w-full bg-charcoal text-ivory h-12 md:h-14 lg:h-16 rounded-lg font-display font-bold text-base md:text-lg lg:text-xl hover:opacity-90 transition-opacity shadow-lg shadow-charcoal/10 disabled:opacity-50"
            >
              {showLoading ? 'Logging in...' : 'Continue'}
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
