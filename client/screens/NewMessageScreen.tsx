
import React from 'react';

interface Contact {
  id: string;
  name: string;
  subtitle?: string;
  initials?: string;
  avatar?: string;
}

interface Props {
  onCancel: () => void;
}

const NewMessageScreen: React.FC<Props> = ({ onCancel }) => {
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

  const ContactItem: React.FC<{ contact: Contact }> = ({ contact }) => (
    <div className="flex items-center gap-4 px-4 py-3 active:bg-slate-800 transition-colors cursor-pointer">
      {contact.avatar ? (
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-slate-700" 
          style={{ backgroundImage: `url("${contact.avatar}")` }}
        />
      ) : (
        <div className="bg-primary/10 flex items-center justify-center rounded-full h-12 w-12 border border-primary/20">
          <span className="font-serif text-primary font-bold">{contact.initials}</span>
        </div>
      )}
      <div className="flex-1 border-b border-slate-800 pb-1">
        <p className="font-serif text-lg font-medium text-white">{contact.name}</p>
        {contact.subtitle && <p className="text-slate-500 text-xs">{contact.subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="relative flex h-full flex-col bg-background-dark text-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="w-12"></div>
          <h1 className="font-serif text-lg font-bold leading-tight tracking-tight text-center">New Message</h1>
          <div className="flex w-12 items-center justify-end">
            <button onClick={onCancel} className="text-primary text-base font-medium leading-normal tracking-wide">Cancel</button>
          </div>
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-serif text-slate-400 text-lg">To:</span>
          <input 
            autoFocus 
            className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none p-0 text-lg font-serif text-white placeholder:text-slate-600" 
            placeholder="Type a name..." 
            type="text"
          />
          <span className="material-symbols-outlined text-primary cursor-pointer">add_circle</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-900/50 px-4 py-2">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-[0.1em]">Suggested</h4>
        </div>
        {suggested.map(c => <ContactItem key={c.id} contact={c} />)}

        {Object.entries(allContacts).map(([letter, contacts]) => (
          <React.Fragment key={letter}>
            <div className="bg-slate-900/50 px-4 py-2">
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-[0.1em]">{letter}</h4>
            </div>
            {contacts.map(c => <ContactItem key={c.id} contact={c} />)}
          </React.Fragment>
        ))}
        
        {/* Spacer for FAB */}
        <div className="h-32"></div>
      </div>

      {/* FAB */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
        <button className="bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform">
          <span className="material-symbols-outlined">group_add</span>
          <span className="font-medium">Create Group</span>
        </button>
      </div>
    </div>
  );
};

export default NewMessageScreen;
