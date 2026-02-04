
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onContinue: (identifier: string) => void;
}

const LoginScreen: React.FC<Props> = ({ onBack, onContinue }) => {
  const [identifier, setIdentifier] = useState('');

  return (
    <div className="relative flex h-full w-full flex-col bg-background-dark p-6 transition-all duration-300">
      {/* Navigation */}
      <nav className="flex items-center pt-2 pb-2 justify-between">
        <button 
          onClick={onBack}
          className="text-primary flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_back_ios_new</span>
        </button>
      </nav>

      {/* Header */}
      <header className="pt-8 pb-2">
        <h1 className="text-white font-serif tracking-tight text-[40px] font-bold leading-tight text-left">
          Welcome back
        </h1>
      </header>

      {/* Instructional Text */}
      <section>
        <p className="text-slate-400 text-lg font-normal leading-relaxed font-serif">
          Sign in to catch up on your <br/>latest conversations.
        </p>
      </section>

      {/* Form */}
      <main className="flex-1 flex flex-col mt-10">
        <div className="flex flex-wrap items-end gap-4 py-3">
          <label className="flex flex-col flex-1">
            <p className="text-white font-serif text-lg font-medium leading-normal pb-3">Email or Mobile Number</p>
            <input 
              className="flex w-full min-w-0 flex-1 rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border border-slate-700 bg-slate-900/50 focus:border-primary h-14 placeholder:text-slate-600 p-[15px] text-base font-normal leading-normal transition-all" 
              placeholder="e.g. name@email.com" 
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
        </div>

        {/* Action Button */}
        <div className="py-6 mt-4">
          <button 
            disabled={!identifier}
            onClick={() => onContinue(identifier)}
            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-white text-lg font-bold leading-normal tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>

        {/* Secondary Action */}
        <div className="flex justify-center py-2">
          <button className="text-primary text-sm font-medium hover:underline font-serif">
            Forgot details?
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-4 text-center mt-auto">
        <p className="text-slate-600 text-[12px] font-normal font-serif">
          By continuing, you agree to our <br/>
          <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
