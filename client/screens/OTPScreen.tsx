
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OTPScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = (location.state as { identifier?: string })?.identifier || '+1 (555) 0123';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) value = value[value.length - 1];
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      // Auto verify when filled
      setTimeout(() => navigate('/profile-setup'), 500);
    }
  }, [code, navigate]);

  return (
    <div className="relative flex h-full w-full flex-col bg-ivory p-4 md:p-6 lg:p-8 xl:p-12 text-charcoal overflow-hidden transition-all duration-300">
      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-primary/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 lg:-mr-32 lg:-mt-32 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-primary/5 rounded-full -ml-24 -mb-24 md:-ml-32 md:-mb-32 lg:-ml-40 lg:-mb-40 blur-3xl pointer-events-none"></div>

      {/* Top Nav */}
      <div className="flex items-center pb-2 md:pb-4 justify-between">
        <button 
          onClick={() => navigate('/login')}
          className="text-charcoal flex size-10 md:size-12 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
        </button>
      </div>

      {/* Content Header */}
      <div className="px-2 md:px-4 lg:px-6 pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8 lg:pb-10">
        <h1 className="tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-tight serif-italic">
          Verify your identity
        </h1>
        <p className="text-charcoal/60 text-xs md:text-sm lg:text-base font-display mt-2 md:mt-3 uppercase tracking-[0.2em]">
          Enter the code we sent to {identifier}
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex flex-col items-center py-8 md:py-12 lg:py-16">
        <fieldset className="flex gap-3 md:gap-4 lg:gap-5">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              className="flex h-14 md:h-16 lg:h-20 w-10 md:w-12 lg:w-14 text-center text-xl md:text-2xl lg:text-3xl font-semibold bg-transparent border-0 border-b-2 border-charcoal/20 focus:border-charcoal focus:ring-0 transition-colors text-charcoal"
              type="number"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </fieldset>
      </div>

      {/* Options */}
      <div className="mt-auto pb-8 md:pb-12 lg:pb-16 flex flex-col items-center gap-4 md:gap-6 max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full px-2 md:px-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-charcoal/60 text-sm md:text-base lg:text-lg font-sans">
            Didn't receive a code?
          </p>
          <button className="text-charcoal hover:text-charcoal/80 text-base md:text-lg lg:text-xl font-semibold underline underline-offset-4 transition-all serif-italic">
            Resend code
          </button>
        </div>
        <button 
          onClick={() => navigate('/profile-setup')}
          className="w-full bg-charcoal text-ivory py-3 md:py-4 lg:py-5 rounded-lg text-base md:text-lg lg:text-xl font-display font-bold shadow-lg shadow-charcoal/10 transition-all active:scale-[0.98]"
        >
          Verify & Continue
        </button>
        <button className="text-charcoal/60 text-xs md:text-sm font-medium hover:text-charcoal transition-colors font-sans">
          Use a different method
        </button>
      </div>
    </div>
  );
};

export default OTPScreen;
