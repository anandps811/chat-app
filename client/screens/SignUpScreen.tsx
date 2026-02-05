import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateName, validateEmail, validatePhoneNumber, validatePassword } from '../utils/validation';
import { sanitizeName, sanitizeEmail, sanitizePhoneNumber } from '../utils/sanitization';

const SignUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bgImg = "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000";

  const handleSignUp = async () => {
    // Clear previous errors
    setError('');
    setNameError('');
    setEmailError('');
    setMobileError('');
    setPasswordError('');

    // Validate all inputs
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || 'Invalid name');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    const phoneValidation = validatePhoneNumber(mobileNumber);
    if (!phoneValidation.isValid) {
      setMobileError(phoneValidation.error || 'Invalid phone number');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || 'Invalid password');
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeName(name);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedMobile = sanitizePhoneNumber(mobileNumber);
    const sanitizedPassword = password.trim(); // Password shouldn't be sanitized too much

    setIsLoading(true);

    try {
      const result = await signup(sanitizedName, sanitizedEmail, sanitizedMobile, sanitizedPassword);
      if (result.success) {
        navigate('/profile-setup');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col lg:flex-row bg-[#fdfdfb] overflow-hidden transition-all duration-300">
      
      {/* Visual Side Panel */}
      <div className="relative h-[15vh] md:h-[20vh] lg:h-full lg:w-1/2 overflow-hidden bg-charcoal">
        <div 
          className="h-full w-full bg-cover bg-center grayscale-[20%] opacity-60" 
          style={{ backgroundImage: `url("${bgImg}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fdfdfb] lg:hidden" />
      </div>

      {/* Form Content Side */}
      <div className="relative flex flex-1 flex-col h-full lg:w-1/2 overflow-y-auto">
        
        {/* Navigation - Original Style */}
        <nav className="flex items-center pt-6 md:pt-8 lg:pt-12 px-6 md:px-12 lg:px-16">
          <button 
            onClick={() => navigate('/')}
            className="text-charcoal flex size-10 md:size-12 items-center justify-start hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
          </button>
        </nav>

        <div className="flex flex-col max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full px-6 md:px-12 lg:px-16 pb-12">
          
          {/* Hero Headline - Original Style */}
          <header className="pt-4 md:pt-8 pb-6 md:pb-10">
            <h1 className="tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-tight serif-italic text-charcoal">
              Create Account
            </h1>
            <p className="text-charcoal/60 text-xs md:text-sm lg:text-base font-display mt-2 md:mt-3 uppercase tracking-[0.2em]">
              Join the refined conversation
            </p>
          </header>

          {/* Error Message - Original Style */}
          {error && (
            <div className="mb-6 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-600 text-sm md:text-base">{error}</p>
            </div>
          )}

          {/* Form Area - Original Style Boxed Inputs */}
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-1 md:pb-2 px-1">Full Name</p>
              <input 
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:ring-1 outline-none transition-all ${
                  nameError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white focus:ring-primary'
                }`}
                placeholder="Evelyn Montgomery" 
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); setNameError(''); }}
                onBlur={() => {
                  if (name.trim()) {
                    const validation = validateName(name);
                    if (!validation.isValid) {
                      setNameError(validation.error || '');
                    }
                  }
                }}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1 px-1">{nameError}</p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-1 md:pb-2 px-1">Email Address</p>
              <input 
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:ring-1 outline-none transition-all ${
                  emailError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white focus:ring-primary'
                }`}
                placeholder="evelyn@aesthetic.com" 
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setEmailError(''); }}
                onBlur={() => {
                  if (email.trim()) {
                    const validation = validateEmail(email);
                    if (!validation.isValid) {
                      setEmailError(validation.error || '');
                    }
                  }
                }}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1 px-1">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-1 md:pb-2 px-1">Mobile Number</p>
              <input 
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:ring-1 outline-none transition-all ${
                  mobileError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white focus:ring-primary'
                }`}
                placeholder="1234567890" 
                type="tel"
                value={mobileNumber}
                onChange={(e) => { setMobileNumber(e.target.value); setError(''); setMobileError(''); }}
                onBlur={() => {
                  if (mobileNumber.trim()) {
                    const validation = validatePhoneNumber(mobileNumber);
                    if (!validation.isValid) {
                      setMobileError(validation.error || '');
                    }
                  }
                }}
              />
              {mobileError && (
                <p className="text-red-500 text-xs mt-1 px-1">{mobileError}</p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-1 md:pb-2 px-1">Password</p>
              <input 
                className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:ring-1 outline-none transition-all ${
                  passwordError 
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500' 
                    : 'border-charcoal/10 bg-white focus:ring-primary'
                }`}
                placeholder="Enter password (min 8 chars)" 
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); setPasswordError(''); }}
                onBlur={() => {
                  if (password.trim()) {
                    const validation = validatePassword(password);
                    if (!validation.isValid) {
                      setPasswordError(validation.error || '');
                    }
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 px-1">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Terms - Original Style */}
          <div className="mt-6">
            <p className="text-charcoal/40 text-[11px] md:text-xs lg:text-sm font-sans leading-relaxed">
              By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

          {/* Action - Original Style Button */}
          <div className="mt-8">
            <button 
              onClick={handleSignUp}
              disabled={isLoading || !name || !email || !mobileNumber || !password}
              className="w-full bg-charcoal text-white h-12 md:h-14 lg:h-16 rounded-lg font-display font-bold text-base md:text-lg lg:text-xl hover:opacity-90 transition-opacity shadow-lg shadow-charcoal/10 disabled:opacity-50"
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>

          {/* Footer - Original Style */}
          <div className="mt-10 flex flex-col items-center">
            <p className="text-charcoal/70 serif-italic text-sm md:text-base lg:text-lg">
              Already have an account? 
              <button 
                onClick={() => navigate('/login')}
                className="text-charcoal font-bold ml-1 not-italic hover:underline underline-offset-4"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;