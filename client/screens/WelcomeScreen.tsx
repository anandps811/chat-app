
import React from 'react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  const bgImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuAOho8UUhAyiUbfquD-vxZsC4-rjFTuzDCVfguzP6EgsIAzVRjKvHFLBFF4Q0ixPqlWDDXNsEbbDwcHhinMRtF3yw52pCkTtNeAhx5Oc6W8pa06ey5hou6mvPr2KntsKEbPPeiYuIq0d1CC-Q48o3nDTmzeIOGep1QTVJYVWBjJJyUaW-1GprMM41JH8xR3OV8SztNO2dFqX0b-ZLzx0qZNORG03arKAPy0O9f75DZr4knkzT_SED9hqKza0fkJ6TgUYkLL8F5bB1Wh";

  return (
    <div className="relative flex h-full w-full flex-col bg-ivory">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="h-full w-full bg-cover bg-center grayscale-[20%] opacity-40" 
          style={{ backgroundImage: `url("${bgImg}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/60 to-ivory" />
      </div>

      {/* Header Label */}
      <div className="relative z-10 flex items-center justify-center p-8 pt-16">
        <div className="text-[10px] font-display uppercase tracking-[0.4em] opacity-60 text-charcoal">
          Collection No. 01
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-10 text-center">
        <div className="mb-6">
          <span className="font-display text-[10px] uppercase tracking-[0.3em] opacity-40 text-charcoal">The New Standard</span>
        </div>
        <h1 className="text-charcoal tracking-tight text-[56px] font-black leading-[1.05] serif-italic mb-8">
          Connect <br/>Beautifully
        </h1>
        <div className="w-12 h-[1px] bg-charcoal/20 mx-auto mb-8"></div>
        <p className="font-sans text-[#555] text-sm font-light leading-relaxed max-w-[240px] mx-auto tracking-wide">
          A sanctuary for meaningful conversation, designed with uncompromising simplicity.
        </p>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 flex flex-col px-10 pb-16 gap-8">
        <div className="flex flex-col gap-6">
          <button 
            onClick={onGetStarted}
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 bg-charcoal text-ivory font-display text-sm font-medium tracking-widest uppercase transition-all hover:bg-black active:scale-[0.98] shadow-sm"
          >
            Get Started
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-[10px] uppercase tracking-widest opacity-40 text-charcoal">Existing Member?</span>
            <button 
              onClick={onLogin}
              className="font-display text-xs font-medium tracking-wider text-charcoal hover:opacity-60 underline underline-offset-8 decoration-charcoal/20"
            >
              Log in
            </button>
          </div>
        </div>
        <div className="h-1 w-12 bg-charcoal/10 mx-auto rounded-full mt-4"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
