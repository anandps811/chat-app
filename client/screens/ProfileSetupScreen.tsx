
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateProfile } from '../hooks';
import { validateName, validateEmail } from '../utils/validation';
import { sanitizeName, sanitizeEmail } from '../utils/sanitization';

const ProfileSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const updateProfileMutation = useUpdateProfile();

  const handleComplete = () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');

    // Validate inputs
    if (name.trim()) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        setNameError(nameValidation.error || 'Invalid name');
        return;
      }
    }

    if (email.trim()) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email');
        return;
      }
    }

    // Check if there are any changes
    const hasChanges =
      (name.trim() && name.trim() !== user?.name) ||
      (email.trim() && email.trim() !== user?.email);

    if (!hasChanges) {
      // No changes, just navigate back
      navigate('/chats');
      return;
    }

    // Sanitize inputs
    const sanitizedName = name.trim() ? sanitizeName(name) : undefined;
    const sanitizedEmail = email.trim() ? sanitizeEmail(email) : undefined;

    updateProfileMutation.mutate(
      {
        name: sanitizedName,
        email: sanitizedEmail,
      },
      {
        onSuccess: (data) => {
          // Update user in AuthContext
          if (data?.user) {
            // The AuthContext will be updated via the custom event dispatched in the hook
            // But we can also update it directly here for immediate UI feedback
          }
          navigate('/chats');
        },
        onError: (error) => {
          // Error is already handled by the error display in the UI
          console.error('Profile update failed:', error);
        },
      }
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-ivory p-4 md:p-6 lg:p-8 xl:p-12 text-charcoal transition-all duration-300">
      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-primary/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 lg:-mr-32 lg:-mt-32 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-primary/5 rounded-full -ml-24 -mb-24 md:-ml-32 md:-mb-32 lg:-ml-40 lg:-mb-40 blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <nav className="flex items-center pt-2 md:pt-4 pb-2 md:pb-4 justify-between">
        <button
          onClick={() => navigate('/chats')}
          className="text-charcoal flex size-10 md:size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
        </button>
        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="text-charcoal text-sm md:text-base font-medium hover:underline font-display flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">logout</span>
          Logout
        </button>
      </nav>

      {/* Header */}
      <header className="px-2 md:px-4 lg:px-6 pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8 lg:pb-10">
        <h1 className="tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-tight serif-italic">
          Update your profile
        </h1>
      </header>


      {/* Error Message */}
      {updateProfileMutation.isError && (
        <div className="mx-2 md:mx-4 mt-4 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-600 text-sm md:text-base">
            {updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : 'Failed to update profile'}
          </p>
        </div>
      )}

      {/* Form Area */}
      <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 px-2 md:px-4 lg:px-6 py-4 md:py-6 max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full">
        <div className="flex flex-col w-full">
          <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">Full Name</p>
          <input
            className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 transition-all outline-none ${nameError
                ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                : 'border-charcoal/10 bg-white/50 focus:ring-primary focus:border-primary'
              }`}
            placeholder="Enter your name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
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
          <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">Email Address</p>
          <input
            className={`flex w-full rounded-lg text-charcoal border h-12 md:h-14 lg:h-16 placeholder:text-charcoal/30 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-lg font-sans focus:bg-white focus:ring-1 transition-all outline-none ${emailError
                ? 'border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                : 'border-charcoal/10 bg-white/50 focus:ring-primary focus:border-primary'
              }`}
            placeholder="hello@example.com"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
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

      </div>

      {/* Action */}
      <div className="px-2 md:px-4 lg:px-6 mt-6 md:mt-8 lg:mt-10 max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full">
        <button
          onClick={handleComplete}
          disabled={updateProfileMutation.isPending}
          className="w-full bg-charcoal text-ivory h-12 md:h-14 lg:h-16 rounded-lg font-display font-bold text-base md:text-lg lg:text-xl hover:opacity-90 transition-opacity shadow-lg shadow-charcoal/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
