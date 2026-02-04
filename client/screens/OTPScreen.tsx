
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  identifier: string;
  onBack: () => void;
  onVerify: () => void;
}

const OTPScreen: React.FC<Props> = ({ identifier, onBack, onVerify }) => {
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
      setTimeout(onVerify, 500);
    }
  }, [code, onVerify]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background-dark p-6 overflow-hidden">
      {/* Top Nav */}
      <div className="flex items-center pb-2 justify-between">
        <button 
          onClick={onBack}
          className="text-white flex size-12 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[28px]">arrow_back_ios</span>
        </button>
      </div>

      {/* Content Header */}
      <div className="pt-10 pb-4">
        <h1 className="text-white font-serif tracking-tight text-[40px] font-bold leading-[1.1] mb-4">
          Verify your identity
        </h1>
        <p className="text-slate-400 font-serif text-lg font-normal leading-relaxed max-w-[300px]">
          Enter the 6-digit code we sent to <span className="text-white font-medium">{identifier}</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex flex-col items-center py-12">
        <fieldset className="flex gap-3 sm:gap-4">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              className="flex h-16 w-12 sm:w-14 text-center text-2xl font-semibold bg-transparent border-0 border-b-2 border-slate-700 focus:border-primary focus:ring-0 transition-colors text-white"
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
      <div className="mt-auto pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-500 text-base font-normal">
            Didn't receive a code?
          </p>
          <button className="text-primary hover:text-primary/80 text-lg font-semibold underline underline-offset-4 italic transition-all font-serif">
            Resend code
          </button>
        </div>
        <button 
          onClick={onVerify}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Verify & Continue
        </button>
        <button className="text-slate-600 text-sm font-medium hover:text-slate-400 transition-colors">
          Use a different method
        </button>
      </div>

      {/* Background Blurs */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
    </div>
  );
};

export default OTPScreen;
