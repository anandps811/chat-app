
import React from 'react';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const ProfileSetupScreen: React.FC<Props> = ({ onComplete, onSkip, onBack }) => {
  const avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBSjjMCtxApnxYra-usrxJv34m0ZNgosVhvM5ZuJzfZl9fsVgK4uJW-9TpWI1sWNHJPz7R0nMMeAVyLkwEdvTWPb4kYE-m7Jeo5zAN2S8suSSWvpyXM1UBMFEJcztioMP-7h3MfyUkDXAzRTJrxt4PY3HnIXLl_fOjLaF4QKesdC7ROcJji2yHAYlR9pz7ol7Wa0guMlt4N-rDANVgbCVC6uwp2yqnoQPcfoCzMJPNRg25nW8ohiDZQowpn5O-JiRs_B6iLz8pyc23p";

  return (
    <div className="relative flex h-full w-full flex-col bg-background-dark text-white">
      {/* Top Nav Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md px-4 py-3 justify-between border-b border-white/5">
        <button 
          onClick={onBack}
          className="text-primary flex size-10 items-center justify-start cursor-pointer"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-white text-[17px] font-semibold leading-tight tracking-tight flex-1 text-center">Profile Setup</h2>
        <div className="size-10 flex items-center justify-end">
          <button onClick={onSkip} className="text-primary text-sm font-medium">Skip</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6">
          <div className="relative group">
            <div 
              className="bg-gray-800 bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-background-dark shadow-xl"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
            <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-background-dark flex items-center justify-center text-white cursor-pointer shadow-lg">
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h1 className="font-playfair text-white text-4xl font-bold tracking-tight mb-2">Create your profile</h1>
            <p className="text-slate-400 text-base font-normal">Let people know who you are.</p>
            <div className="inline-flex mt-4 items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest">Step 1 of 3</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6 px-6">
          <div className="flex flex-col gap-2">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1">Full Name</label>
            <input 
              className="w-full rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-800 bg-[#192633] h-14 placeholder:text-[#92adc9] px-4 text-base font-normal leading-normal transition-all" 
              placeholder="Enter your name" 
              type="text" 
              defaultValue="Julian Casablancas"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1">Email Address</label>
            <input 
              className="w-full rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-800 bg-[#192633] h-14 placeholder:text-[#92adc9] px-4 text-base font-normal leading-normal transition-all" 
              placeholder="hello@example.com" 
              type="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1">Bio</label>
            <textarea 
              className="w-full rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-800 bg-[#192633] placeholder:text-[#92adc9] p-4 text-base font-normal leading-normal transition-all resize-none" 
              placeholder="Tell us about yourself..." 
              rows={4}
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-12 px-6">
          <button 
            onClick={onComplete}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            Complete Setup
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <p className="mt-6 text-center text-slate-500 text-xs px-8">
            By continuing, you agree to our <span className="text-primary font-medium">Terms of Service</span> and <span className="text-primary font-medium">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
