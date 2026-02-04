
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchUsers, useGetOrCreateChat } from '../hooks';

interface Contact {
  id: string;
  name: string;
  subtitle?: string;
  initials?: string;
  avatar?: string;
}

const NewMessageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: contacts = [], isLoading, error } = useSearchUsers(
    searchQuery,
    searchQuery.trim().length > 0
  );
  const createChatMutation = useGetOrCreateChat();

  const handleContactSelect = async (contactId: string) => {
    createChatMutation.mutate(contactId, {
      onSuccess: (chat) => {
        // Extract chatId from the chat object (Mongoose returns _id)
        const chatId = chat?._id || chat?.id || chat;
        const chatIdString = typeof chatId === 'string' ? chatId : chatId?.toString();
        
        if (chatIdString) {
          console.log('Chat created successfully, chatId:', chatIdString);
          navigate(`/chats/${chatIdString}`);
        } else {
          console.error('Failed to extract chatId from chat:', chat);
        }
      },
      onError: (error) => {
        console.error('Error creating chat:', error);
        // Error is handled by the mutation state
      },
    });
  };

  const suggested: Contact[] = [
    { 
      id: 's1', 
      name: 'Adeline Montgomery', 
      subtitle: 'Recently active', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI9bMnOGAM3kHQKCIOyxEml-5hHNHl4Yf81oZ7tvKXXT8Xl5iInJhFajzy-IBrrDJdQHTkaPIw2bSowspgtuNzrn-PnFQ7MrcH1whtSWE_p2VpwDqJvHkqrabSi_TefygJdfKireDf-p98x_Q6ybDBfIAXBIOGCQ8NSYDV3a2i9MtaXJPnmNz3hbsL0EcuXpIe0fa9HBBGFFieUKpUShcF0kvDImhcbDBEqAsirdcBlVp5Qka4MHEQuap_TV3UDM2gdQtqrFVeubvH' 
    },
    { 
      id: 's2', 
      name: 'Arthur Sinclair', 
      subtitle: 'Mobile', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7rrLbfeXQlPbyA-xLwbZ0yB1vTDzinLRakHl_fcrUZcmOZnjJgldHO4wh_IaNNVO72WgSSG6OnO1azQn-qezNL8Ub7YdTIQfqXkfYhOa6x7KEC375i7nUOW0I_WENZt59XKZkQCZJ3BVotPatOj6e-Sz_tfunwNroUQjEujByGfGQ0fHroQFgPVKPvWU3pVFoIW2njMGzciSP5iSh6FrBLqeASXZNxkX6MxG2YpmGlHBLqWXx8gCpdUfaMsLgcDWyQeah_GzasqJk' 
    }
  ];

  const allContacts: Record<string, Contact[]> = {
    'A': [
      { id: 'a1', name: 'Abigail Adams', initials: 'AA' },
      { id: 'a2', name: 'Alistair Thorne', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnxHE1etMulMAmiZMQQErcSf1W5-2YXqhKSIdM5Rfc9sFzO3DMhM7lnVj7Q5dnUijkHZyNH61Avc3cF0vN_ksTBbYmYVF7dyYeZbf-XBgpSxLeZKfhHuZQwR1utbbiuYDwhmDlLj6FmMUjM4qkKk9zrijJa_kkHR0sAd4IRb4ld2xl2p2DSk44MFW5JtaBM6whqodxleHxsOHptkcMrDyVmsMaOlOMKkjNSXWzMbgMm815U6jVUQECn7IDMrB58IjT9aXeMOJT48sI' }
    ],
    'B': [
      { id: 'b1', name: 'Beatrice Vane', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBKCI_Pts2m23O_p_P16GUoApSKoFLYgZVdMk30IyohrGBQxfLRAZq5ngaSa1eonaUeM3xvJ9TczassrQ1MtPJPqetWqiizUTuSUYt6dGsBZlifEjz6Y5QF2_gqsyZH8iyx7EaEsDE7nHbCEie-UzrCh1Xop3Ps574r7PkWtWHY7yC3dyKY3Nohtp7ok96bCWZe-SZdByJngpAYFoczmFxsw4mMkC_HMgd2Z39zGZ3VCF5zvAJpS73XN_NyZdF4EMBprSg7Yn4035z' },
      { id: 'b2', name: 'Byron Wallace', initials: 'BW' }
    ]
  };


  return (
    <div className="relative flex h-full w-full flex-col bg-ivory p-4 md:p-6 lg:p-8 text-charcoal transition-all duration-300 overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-primary/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 lg:-mr-32 lg:-mt-32 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-primary/5 rounded-full -ml-24 -mb-24 md:-ml-32 md:-mb-32 lg:-ml-40 lg:-mb-40 blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <nav className="flex items-center pt-2 md:pt-4 pb-2 md:pb-4 justify-between">
        <div className="flex-1"></div>
        <button 
          onClick={() => navigate('/chats')}
          className="text-charcoal text-sm md:text-base font-medium hover:underline font-display"
        >
          Cancel
        </button>
      </nav>

      {/* Header */}
      <header className="px-2 md:px-4 lg:px-6 pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8 lg:pb-10">
        <h1 className="tracking-tight text-3xl md:text-4xl lg:text-5xl font-bold leading-tight serif-italic">
          New Message
        </h1>
        <p className="text-charcoal/60 text-xs md:text-sm lg:text-base font-display mt-2 md:mt-3 uppercase tracking-[0.2em]">
          Start a conversation
        </p>
      </header>

      {/* Error Message */}
      {(error || createChatMutation.isError) && (
        <div className="mx-2 md:mx-4 mt-4 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-600 text-sm md:text-base">
            {error instanceof Error ? error.message : createChatMutation.error instanceof Error ? createChatMutation.error.message : 'An error occurred'}
          </p>
        </div>
      )}

      {/* Form Area */}
      <div className="flex flex-col gap-4 md:gap-6 px-2 md:px-4 lg:px-6 py-4 md:py-6 max-w-2xl mx-auto w-full">
        <div className="flex flex-col w-full">
          <p className="text-charcoal/80 text-sm md:text-base font-bold serif-italic leading-normal pb-2 md:pb-3 px-1">Search</p>
          <div className="flex w-full items-center rounded-lg border border-charcoal/10 bg-white/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="text-charcoal/40 flex items-center justify-center pl-3 md:pl-4">
              <span className="material-symbols-outlined text-lg md:text-xl">search</span>
            </div>
            <input 
              autoFocus
              className="flex-1 border-none bg-transparent text-charcoal focus:ring-0 placeholder:text-charcoal/30 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-normal outline-none font-sans" 
              placeholder="Type a name or email..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {(isLoading || createChatMutation.isPending) && (
              <span className="material-symbols-outlined text-charcoal/60 animate-spin mr-3 text-lg md:text-xl">refresh</span>
            )}
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto mt-2 md:mt-4 px-2 md:px-4 lg:px-6 max-w-2xl mx-auto w-full">
        {searchQuery.trim().length > 0 ? (
          <>
            {contacts.length > 0 ? (
              <div className="flex flex-col gap-2 md:gap-3">
                {contacts.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => handleContactSelect(c.id)}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 lg:p-5 rounded-lg border border-charcoal/10 bg-white/50 hover:bg-white cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <ContactItem contact={c} />
                  </div>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-charcoal/60 font-sans text-sm md:text-base">No users found</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-charcoal/60 font-sans text-sm md:text-base">Searching...</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2 md:gap-3">
            {suggested.map(c => (
              <div 
                key={c.id} 
                onClick={() => handleContactSelect(c.id)}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 lg:p-5 rounded-lg border border-charcoal/10 bg-white/50 hover:bg-white cursor-pointer active:scale-[0.98] transition-all"
              >
                <ContactItem contact={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContactItem: React.FC<{ contact: Contact }> = ({ contact }) => (
  <>
    {contact.avatar ? (
      <div 
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 border border-charcoal/10" 
        style={{ backgroundImage: `url("${contact.avatar}")` }}
      />
    ) : (
      <div className="bg-charcoal/10 flex items-center justify-center rounded-full h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 border border-charcoal/10">
        <span className="font-display text-charcoal font-bold text-sm md:text-base lg:text-lg">{contact.initials || contact.name.charAt(0).toUpperCase()}</span>
      </div>
    )}
    <div className="flex flex-col justify-center flex-1 min-w-0">
      <p className="serif-italic text-sm md:text-base lg:text-lg font-bold text-charcoal leading-tight truncate">{contact.name}</p>
      {contact.subtitle && <p className="text-charcoal/60 text-xs md:text-sm font-sans truncate">{contact.subtitle}</p>}
    </div>
  </>
);

export default NewMessageScreen;
