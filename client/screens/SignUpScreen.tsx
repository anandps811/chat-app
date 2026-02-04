
import React from 'react';

interface Props {
  onBack: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

const SignUpScreen: React.FC<Props> = ({ onBack, onSignUp, onLogin }) => {
  return (
    <div className="relative flex h-full w-full flex-col bg-[#fdfdfb] p-6 text-charcoal">
      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <div className="flex items-center pb-2 justify-between">
        <button 
          onClick={onBack}
          className="flex size-10 items-center justify-start cursor-pointer hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
      </div>

      {/* Hero Headline */}
      <div className="px-2 pt-12 pb-8">
        <h1 className="tracking-tight text-[42px] font-bold leading-tight serif-italic">
          Create Account
        </h1>
        <p className="text-charcoal/60 text-xs font-display mt-2 uppercase tracking-[0.2em]">
          Join the refined conversation
        </p>
      </div>

      {/* Form Area */}
      <div className="flex flex-col gap-6 px-2 py-4">
        <div className="flex flex-col w-full">
          <p className="text-charcoal/80 text-sm font-bold serif-italic leading-normal pb-2 px-1">Full Name</p>
          <input 
            className="flex w-full rounded-lg text-charcoal border border-charcoal/10 bg-white/50 h-14 placeholder:text-charcoal/30 px-4 font-sans focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" 
            placeholder="Evelyn Montgomery" 
            type="text"
          />
        </div>
        <div className="flex flex-col w-full">
          <p className="text-charcoal/80 text-sm font-bold serif-italic leading-normal pb-2 px-1">Email Address</p>
          <input 
            className="flex w-full rounded-lg text-charcoal border border-charcoal/10 bg-white/50 h-14 placeholder:text-charcoal/30 px-4 font-sans focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" 
            placeholder="evelyn@aesthetic.com" 
            type="email"
          />
        </div>
        <div className="flex flex-col w-full">
          <p className="text-charcoal/80 text-sm font-bold serif-italic leading-normal pb-2 px-1">Mobile Number</p>
          <input 
            className="flex w-full rounded-lg text-charcoal border border-charcoal/10 bg-white/50 h-14 placeholder:text-charcoal/30 px-4 font-sans focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" 
            placeholder="+1 (555) 000-0000" 
            type="tel"
          />
        </div>
      </div>

      {/* Terms */}
      <div className="px-2 mt-4">
        <p className="text-charcoal/40 text-[11px] font-sans leading-relaxed">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Action */}
      <div className="px-2 mt-10">
        <button 
          onClick={onSignUp}
          className="w-full bg-charcoal text-white h-14 rounded-lg font-display font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-charcoal/10"
        >
          Sign Up
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pb-6 pt-8 flex flex-col items-center">
        <p className="text-charcoal/70 serif-italic text-base">
          Already have an account? 
          <button 
            onClick={onLogin}
            className="text-primary font-bold ml-1 not-italic hover:underline underline-offset-4"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;
