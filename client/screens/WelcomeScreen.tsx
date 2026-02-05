import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const bgImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuAOho8UUhAyiUbfquD-vxZsC4-rjFTuzDCVfguzP6EgsIAzVRjKvHFLBFF4Q0ixPqlWDDXNsEbbDwcHhinMRtF3yw52pCkTtNeAhx5Oc6W8pa06ey5hou6mvPr2KntsKEbPPeiYuIq0d1CC-Q48o3nDTmzeIOGep1QTVJYVWBjJJyUaW-1GprMM41JH8xR3OV8SztNO2dFqX0b-ZLzx0qZNORG03arKAPy0O9f75DZr4knkzT_SED9hqKza0fkJ6TgUYkLL8F5bB1Wh";

  return (
    <div className="relative flex h-screen w-full flex-col lg:flex-row bg-ivory overflow-hidden">
      {/* Background Layer - Becomes a side panel on Desktop */}
      <div className="absolute inset-0 z-0 lg:relative lg:w-1/2 lg:h-full">
        <div 
          className="h-full w-full bg-cover bg-center grayscale-[20%] opacity-40 lg:opacity-100" 
          style={{ backgroundImage: `url("${bgImg}")` }}
        />
        {/* Mobile Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/60 to-ivory lg:hidden" />
        {/* Desktop subtle overlay for depth */}
        <div className="hidden lg:block absolute inset-0 bg-charcoal/5" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col h-full lg:w-1/2">
        
        {/* Header Label - Repositioned for flow */}
        <div className="flex items-center justify-center p-6 md:p-8 lg:px-16 lg:pt-16 pt-12 items-center">
          <div className="text-[10px] md:text-xs font-display uppercase tracking-[0.4em] opacity-60 text-charcoal items-center">
            Collection
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-1 flex-col justify-center items-center px-6 md:px-16 lg:px-16 xl:px-24 text-center md:text-left">
          <div className="mb-4 md:mb-6 lg:mb-4 items-center">
            <span className="font-display text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-40 text-charcoal">
                The New Standard
            </span>
          </div>
          <h1 className="text-charcoal tracking-tight text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] serif-italic mb-6 md:mb-8 max-w-[240px] md:max-w-none mx-auto md:mx-0">
            Connect <br /> Beautifully
          </h1>
          <div className="w-12 md:w-16 h-[1px] bg-charcoal/20 mx-auto md:mx-0 mb-6 md:mb-8"></div>
          <p className="font-sans text-[#555] text-sm md:text-base lg:text-lg font-light leading-relaxed max-w-[240px] md:max-w-md lg:max-w-lg mx-auto md:mx-0 tracking-wide">
            A sanctuary for meaningful conversation, designed with uncompromising simplicity.
          </p>
        </div>

        {/* Footer Actions - Anchored at bottom on Desktop */}
        <div className="flex flex-col px-6 md:px-16 lg:px-16 xl:px-24 pb-12 md:pb-16 lg:pb-16 gap-6 md:gap-8 w-full">
          <div className="flex flex-col gap-4 md:gap-6 items-center">
            <button 
              onClick={() => navigate('/signup')}
              className="flex w-full cursor-pointer items-center justify-center rounded-full h-12 md:h-14 lg:h-16 bg-charcoal text-ivory font-display text-sm md:text-base lg:text-lg font-medium tracking-widest uppercase transition-all hover:bg-black active:scale-[0.98] shadow-sm max-w-md"
            >
              Get Started
            </button>
            
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <span className="font-display text-[10px] md:text-xs uppercase tracking-widest opacity-40 text-charcoal">
                Existing Member?
              </span>
              <button 
                onClick={() => navigate('/login')}
                className="font-display text-xs md:text-sm font-medium tracking-wider text-charcoal hover:opacity-60 underline underline-offset-8 decoration-charcoal/20"
              >
                Log in
              </button>
            </div>
          </div>
          {/* Visual flourish */}
          <div className="h-1 w-12 md:w-16 bg-charcoal/10 mx-auto rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;