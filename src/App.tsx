import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  BookmarkCheck, 
  Search, 
  Plus, 
  ArrowUpRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Bell, 
  Sparkles, 
  BookMarked, 
  ShieldCheck, 
  UserPlus, 
  X, 
  Calendar as CalendarIcon, 
  Layers 
} from 'lucide-react';
import type { Book, Member, BorrowRecord, ActivityTask } from './types';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'members' | 'borrowing' | 'calendar'>('dashboard');

  // Persistent State (empty by default, loaded from localStorage if user adds items)
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('librextio_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('librextio_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [borrows, setBorrows] = useState<BorrowRecord[]>(() => {
    const saved = localStorage.getItem('librextio_borrows');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<ActivityTask[]>(() => {
    const saved = localStorage.getItem('librextio_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('librextio_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('librextio_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('librextio_borrows', JSON.stringify(borrows));
  }, [borrows]);

  useEffect(() => {
    localStorage.setItem('librextio_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Time Tracker state
  const [readingTimerActive, setReadingTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'Technology' as Book['category'],
    isbn: '',
    totalCopies: 1,
    cover: '',
    description: '',
    publishedYear: new Date().getFullYear()
  });

  // New Member Form State
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    membershipId: '',
    role: 'Student' as Member['role'],
    maxBorrows: 4
  });

  // Borrow Form State
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<string>('');
  const [selectedMemberForBorrow, setSelectedMemberForBorrow] = useState<string>('');

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (readingTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [readingTimerActive]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const bookToAdd: Book = {
      id: `b${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      isbn: newBook.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      cover: newBook.cover.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      totalCopies: Number(newBook.totalCopies) || 1,
      availableCopies: Number(newBook.totalCopies) || 1,
      rating: 5.0,
      publishedYear: Number(newBook.publishedYear) || new Date().getFullYear(),
      description: newBook.description || 'No description provided.'
    };

    setBooks([bookToAdd, ...books]);
    setIsAddBookOpen(false);
    setNewBook({
      title: '',
      author: '',
      category: 'Technology',
      isbn: '',
      totalCopies: 1,
      cover: '',
      description: '',
      publishedYear: new Date().getFullYear()
    });
    showToast(`"${bookToAdd.title}" cataloged successfully!`);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const memberToAdd: Member = {
      id: `m${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (members.length % 5) * 100}?auto=format&fit=crop&q=80&w=200`,
      membershipId: newMember.membershipId || `LIB-${Math.floor(1000 + Math.random() * 9000)}`,
      role: newMember.role,
      activeBorrows: 0,
      maxBorrows: Number(newMember.maxBorrows) || 4,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setMembers([memberToAdd, ...members]);
    setIsAddMemberOpen(false);
    setNewMember({
      name: '',
      email: '',
      membershipId: '',
      role: 'Student',
      maxBorrows: 4
    });
    showToast(`Member "${memberToAdd.name}" enrolled!`);
  };

  const handleIssueBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const book = books.find(b => b.id === selectedBookForBorrow);
    const member = members.find(m => m.id === selectedMemberForBorrow);

    if (!book || !member) {
      showToast('Please select both a book and a member.');
      return;
    }

    if (book.availableCopies <= 0) {
      showToast('No copies available for loan!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newBorrow: BorrowRecord = {
      id: `br-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.cover,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      borrowDate: today,
      dueDate: dueDateStr,
      status: 'Active'
    };

    setBorrows([newBorrow, ...borrows]);
    setBooks(books.map(b => b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b));
    setMembers(members.map(m => m.id === member.id ? { ...m, activeBorrows: m.activeBorrows + 1 } : m));
    setIsBorrowModalOpen(false);
    setSelectedBookForBorrow('');
    setSelectedMemberForBorrow('');
    showToast(`Issued "${book.title}" to ${member.name}!`);
  };

  const handleReturnBook = (borrowId: string) => {
    const record = borrows.find(b => b.id === borrowId);
    if (!record || record.status === 'Returned') return;

    setBorrows(borrows.map(b => b.id === borrowId ? { ...b, status: 'Returned', returnDate: new Date().toISOString().split('T')[0] } : b));
    setBooks(books.map(b => b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b));
    setMembers(members.map(m => m.id === record.memberId ? { ...m, activeBorrows: Math.max(0, m.activeBorrows - 1) } : m));
    showToast(`Returned: "${record.bookTitle}"`);
  };

  // Stats calculation
  const totalBooksCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const activeLoansCount = borrows.filter(b => b.status === 'Active' || b.status === 'Overdue').length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#1E2024] p-4 md:p-8 font-sans selection:bg-[#F5C451]/30">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1D21] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#F5C451]" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-[#FAF8F2] via-[#F6F1E5] to-[#F1ECE0] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 md:p-10 border border-amber-100/60 relative overflow-hidden">
        
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FEEBBA]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* TOP BAR / NAVIGATION */}
        <header className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200/80 shadow-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1D21]"></span>
              <span className="font-extrabold tracking-tight text-xl text-[#1C1D21]">Librextio</span>
              <span className="text-xs bg-[#F5C451]/30 text-amber-900 font-semibold px-2 py-0.5 rounded-full">Pro</span>
            </div>
          </div>

          {/* Pill Navigation Bar */}
          <nav className="flex items-center bg-white/70 backdrop-blur-md p-1.5 rounded-full border border-stone-200/80 shadow-sm text-sm font-medium">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'dashboard' ? 'bg-[#1C1D21] text-white shadow-md' : 'text-stone-600 hover:text-black'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'catalog' ? 'bg-[#1C1D21] text-white shadow-md' : 'text-stone-600 hover:text-black'
              }`}
            >
              Catalog {books.length > 0 && `(${books.length})`}
            </button>
            <button 
              onClick={() => setActiveTab('borrowing')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'borrowing' ? 'bg-[#1C1D21] text-white shadow-md' : 'text-stone-600 hover:text-black'
              }`}
            >
              Loans & Returns {activeLoansCount > 0 && `(${activeLoansCount})`}
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'members' ? 'bg-[#1C1D21] text-white shadow-md' : 'text-stone-600 hover:text-black'
              }`}
            >
              Members {members.length > 0 && `(${members.length})`}
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`px-5 py-2 rounded-full transition-all duration-200 hidden sm:block ${
                activeTab === 'calendar' ? 'bg-[#1C1D21] text-white shadow-md' : 'text-stone-600 hover:text-black'
              }`}
            >
              Schedule
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (books.length === 0 || members.length === 0) {
                  showToast('Please add at least one book and one member first!');
                  return;
                }
                setIsBorrowModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#F5C451] hover:bg-[#eab638] text-stone-900 font-semibold px-4 py-2 rounded-full text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Issue Book
            </button>
            
            <button 
              onClick={() => setIsAddBookOpen(true)}
              className="p-2.5 bg-white/80 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 shadow-sm"
              title="Add New Book"
            >
              <BookMarked className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsAddMemberOpen(true)}
              className="p-2.5 bg-white/80 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 shadow-sm"
              title="Register Member"
            >
              <UserPlus className="w-4 h-4" />
            </button>

            <button className="p-2.5 bg-white/80 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 shadow-sm relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* HERO WELCOME & METRIC COUNTERS */}
        <section className="relative z-10 pt-8 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-stone-900">
              Welcome to <span className="font-semibold text-black">Library Management</span>
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm md:text-base">
              System Dashboard & Circulation Desk
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Borrow Rate: {totalBooksCount > 0 ? Math.round((activeLoansCount / totalBooksCount) * 100) : 0}%
              </div>
              <div className="flex items-center bg-[#F5C451] text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-full">
                Available: {books.reduce((acc, b) => acc + b.availableCopies, 0)}
              </div>
              <div className="flex items-center bg-white/80 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full border border-stone-200">
                Registered: {members.length} Patrons
              </div>
            </div>
          </div>

          {/* Big Number Counters */}
          <div className="flex items-center gap-8 self-start lg:self-auto bg-white/50 backdrop-blur-sm px-7 py-4 rounded-3xl border border-stone-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-100/80 text-amber-900">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <div className="text-3xl font-light text-stone-900 leading-tight">{totalBooksCount}</div>
                <div className="text-xs text-stone-500 font-medium">Total Volumes</div>
              </div>
            </div>

            <div className="h-10 w-px bg-stone-200"></div>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-stone-100 text-stone-800">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <div className="text-3xl font-light text-stone-900 leading-tight">{members.length}</div>
                <div className="text-xs text-stone-500 font-medium">Scholars & Faculty</div>
              </div>
            </div>

            <div className="h-10 w-px bg-stone-200"></div>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-[#F5C451]/30 text-stone-900">
                <BookmarkCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="text-3xl font-light text-stone-900 leading-tight">{activeLoansCount}</div>
                <div className="text-xs text-stone-500 font-medium">Active Loans</div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
            
            {/* COLUMN 1: Profile & System Info (Width: 3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl mb-4">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900">Circulation Desk</h3>
                  <p className="text-xs text-stone-500 mt-1">Ready for cataloging, checkouts and returns.</p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>System Status</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Storage</span>
                    <span className="font-mono text-stone-700">Local (Browser)</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-stone-200/70 space-y-3">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">Quick Actions</span>
                
                <button 
                  onClick={() => setIsAddBookOpen(true)}
                  className="w-full text-left p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between text-xs font-semibold text-stone-800 border border-stone-200/50"
                >
                  <span className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-amber-600" /> Catalog New Book
                  </span>
                  <Plus className="w-4 h-4 text-stone-400" />
                </button>

                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="w-full text-left p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between text-xs font-semibold text-stone-800 border border-stone-200/50"
                >
                  <span className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4 text-stone-700" /> Enroll New Member
                  </span>
                  <Plus className="w-4 h-4 text-stone-400" />
                </button>

                <button 
                  onClick={() => {
                    if (books.length === 0 || members.length === 0) {
                      showToast('Please add books and members first!');
                      return;
                    }
                    setIsBorrowModalOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between text-xs font-semibold text-amber-900 border border-amber-200/60"
                >
                  <span className="flex items-center gap-2.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-700" /> Issue Loan
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-amber-700" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: Circulation Graph, Session Tracker & Overview (Width: 6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Activity Bar Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-semibold text-stone-400 tracking-wider">Weekly Ingestion</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-light text-stone-900">{totalBooksCount}</span>
                        <span className="text-xs text-stone-400">Items cataloged</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 pb-2">
                    <div className="flex items-end justify-between h-28 px-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div 
                            className={`w-2.5 rounded-full ${idx === 5 ? 'bg-[#F5C451] h-16' : 'bg-stone-200 h-6'}`}
                          ></div>
                          <span className="text-[10px] font-semibold text-stone-400">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Circular Session Tracker Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-semibold text-stone-400 tracking-wider">Session Clock</span>
                      <div className="text-xs text-stone-500 mt-0.5">Desk Study Timer</div>
                    </div>
                  </div>

                  {/* Circular Dial */}
                  <div className="flex justify-center my-2">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#EBE5D8"
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#F5C451"
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray="264"
                          strokeDashoffset={264 - (264 * Math.min(timerSeconds, 3600)) / 3600}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center text-center">
                        <span className="text-2xl font-semibold tracking-tight text-stone-900 font-mono">
                          {formatTimer(timerSeconds)}
                        </span>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button 
                      onClick={() => setReadingTimerActive(!readingTimerActive)}
                      className={`p-2.5 rounded-full ${readingTimerActive ? 'bg-amber-500 text-white' : 'bg-stone-900 text-white'} shadow-md hover:opacity-90 transition-all`}
                    >
                      {readingTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button 
                      onClick={() => { setReadingTimerActive(false); setTimerSeconds(0); }}
                      className="p-2.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity / Active Borrows Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <span className="text-sm font-semibold text-stone-900">Current Circulation Highlights</span>
                  <span className="text-xs text-stone-400 font-medium">Real-time status</span>
                </div>

                {borrows.length === 0 ? (
                  <div className="text-center py-8">
                    <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-600">No active book loans currently</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Use "Issue Book" to check out a volume to a member.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {borrows.slice(0, 3).map(b => (
                      <div key={b.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={b.bookCover} alt="" className="w-8 h-10 object-cover rounded-md" />
                          <div>
                            <div className="font-semibold text-stone-900">{b.bookTitle}</div>
                            <div className="text-stone-500 text-[11px]">Issued to {b.memberName} • Due {b.dueDate}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-medium ${b.status === 'Active' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 3: Task Pill & Dark Task Log (Width: 3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-stone-900">Daily Checklist</span>
                  <span className="text-lg font-light text-stone-900">
                    {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex gap-1.5">
                  <div className="h-6 flex-1 bg-[#F5C451] rounded-full flex items-center justify-center text-[11px] font-bold text-stone-900">
                    Tasks
                  </div>
                  <div className="h-6 flex-1 bg-[#1C1D21] rounded-full flex items-center justify-center text-[11px] font-semibold text-white">
                    Logs
                  </div>
                  <div className="h-6 flex-1 bg-stone-200 rounded-full flex items-center justify-center text-[11px] font-medium text-stone-500">
                    Sync
                  </div>
                </div>
              </div>

              {/* The Dark Task Container */}
              <div className="bg-[#1C1D21] text-white rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-col justify-between min-h-[380px]">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                    <div className="font-semibold text-base">Curator Daily Log</div>
                    <span className="text-xs font-mono bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                      {completedTasksCount}/{tasks.length} Done
                    </span>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="py-12 text-center text-stone-500">
                      <p className="text-xs">No tasks added yet.</p>
                      <p className="text-[11px] text-stone-600 mt-1">Click "+ Add Task" below to create daily to-dos.</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3.5 max-h-72 overflow-y-auto pr-1">
                      {tasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex items-start justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                            task.completed ? 'bg-stone-800/40 opacity-75' : 'bg-stone-800/80 hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button className="mt-0.5 text-stone-400 hover:text-white">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#F5C451]" />
                              ) : (
                                <Circle className="w-4 h-4 text-stone-500" />
                              )}
                            </button>
                            <div>
                              <p className={`text-xs font-medium ${task.completed ? 'line-through text-stone-400' : 'text-stone-200'}`}>
                                {task.title}
                              </p>
                              <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">{task.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ready
                  </span>
                  <button 
                    onClick={() => {
                      const newTitle = prompt('Enter task description:');
                      if (newTitle && newTitle.trim()) {
                        setTasks([...tasks, {
                          id: `t${Date.now()}`,
                          title: newTitle.trim(),
                          time: 'Today',
                          completed: false,
                          type: 'catalog'
                        }]);
                      }
                    }}
                    className="text-[#F5C451] hover:underline font-semibold"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div className="relative z-10 mt-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-stone-200/80 shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 placeholder-stone-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Technology', 'Design', 'Science', 'History', 'Business', 'Fiction'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[#1C1D21] text-white shadow-sm' 
                        : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsAddBookOpen(true)}
                className="flex items-center gap-2 bg-[#F5C451] hover:bg-[#e4b545] text-stone-900 font-semibold px-5 py-2.5 rounded-full text-xs shadow-sm ml-auto"
              >
                <Plus className="w-4 h-4" /> Add Book
              </button>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/70 shadow-sm">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-stone-800">No books found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {searchQuery ? 'No cataloged books match your search filters.' : 'The catalog is currently empty. Click the button below to add your first book!'}
                </p>
                <button 
                  onClick={() => setIsAddBookOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-[#1C1D21] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm hover:bg-stone-800 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Your First Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <div 
                    key={book.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/70 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex gap-4">
                        <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-stone-100">
                          <img 
                            src={book.cover} 
                            alt={book.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-full">
                            {book.category}
                          </span>
                          <h4 className="font-semibold text-stone-900 text-base mt-1 line-clamp-2 leading-snug">
                            {book.title}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1">By {book.author}</p>
                          <p className="text-[11px] font-mono text-stone-400 mt-1">ISBN: {book.isbn}</p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 mt-4 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {book.availableCopies} of {book.totalCopies} available
                        </div>
                        <div className="w-24 h-1.5 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              book.availableCopies === 0 ? 'bg-red-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (members.length === 0) {
                            showToast('Please add at least one member first!');
                            return;
                          }
                          setSelectedBookForBorrow(book.id);
                          setIsBorrowModalOpen(true);
                        }}
                        disabled={book.availableCopies === 0}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                          book.availableCopies > 0
                            ? 'bg-[#1C1D21] text-white hover:bg-stone-800'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {book.availableCopies > 0 ? 'Issue Loan' : 'Reserved Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BORROWING & RETURNS VIEW */}
        {activeTab === 'borrowing' && (
          <div className="relative z-10 mt-6 space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/80 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-stone-900">Circulation Records</h3>
                <p className="text-xs text-stone-500 mt-0.5">Real-time checkouts, due dates and return logs</p>
              </div>
              <button 
                onClick={() => {
                  if (books.length === 0 || members.length === 0) {
                    showToast('Please add books and members first!');
                    return;
                  }
                  setIsBorrowModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#F5C451] hover:bg-[#e4b545] text-stone-900 font-semibold px-5 py-2.5 rounded-full text-xs shadow-sm"
              >
                <Plus className="w-4 h-4" /> Issue Loan
              </button>
            </div>

            {borrows.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/70 shadow-sm">
                <BookmarkCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-stone-800">No circulation records yet</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  When you check out books to library members, their loan periods, due dates, and return statuses will be tracked here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs text-stone-400 uppercase tracking-wider">
                      <th className="pb-4 font-semibold">Book Title</th>
                      <th className="pb-4 font-semibold">Member / Scholar</th>
                      <th className="pb-4 font-semibold">Borrow Date</th>
                      <th className="pb-4 font-semibold">Due Date</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {borrows.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img src={item.bookCover} alt="" className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                            <span className="font-semibold text-stone-900">{item.bookTitle}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                              {item.memberName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-stone-800">{item.memberName}</div>
                              <div className="text-[11px] text-stone-400">{item.memberId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-mono text-stone-600">{item.borrowDate}</td>
                        <td className="py-4 text-xs font-mono text-stone-600">{item.dueDate}</td>
                        <td className="py-4">
                          {item.status === 'Active' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                              Borrowed
                            </span>
                          )}
                          {item.status === 'Overdue' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              Overdue
                            </span>
                          )}
                          {item.status === 'Returned' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Returned ({item.returnDate})
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {item.status !== 'Returned' ? (
                            <button
                              onClick={() => handleReturnBook(item.id)}
                              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1C1D21] text-white hover:bg-stone-800 shadow-sm"
                            >
                              Mark Return
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400 font-medium italic">Archived</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEMBERS VIEW */}
        {activeTab === 'members' && (
          <div className="relative z-10 mt-6 space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/80 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-stone-900">Registered Members & Scholars</h3>
                <p className="text-xs text-stone-500 mt-0.5">Active cards, borrowing capacities and membership standings</p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-2 bg-[#F5C451] hover:bg-[#e4b545] text-stone-900 font-semibold px-5 py-2.5 rounded-full text-xs shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Enroll New Member
              </button>
            </div>

            {members.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/70 shadow-sm">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-stone-800">No members registered</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Add patrons, students, faculty, or community members to begin issuing books.
                </p>
                <button 
                  onClick={() => setIsAddMemberOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-[#1C1D21] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm hover:bg-stone-800 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Enroll First Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map(m => (
                  <div key={m.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 shadow-sm flex items-center justify-center font-bold text-stone-700 text-lg">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-stone-900 text-sm leading-tight">{m.name}</h4>
                          <span className="text-[10px] text-stone-400 font-mono block">{m.membershipId}</span>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                            {m.role}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Email</span>
                          <span className="font-medium text-stone-800 truncate max-w-[130px]">{m.email}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Joined</span>
                          <span className="font-medium text-stone-800">{m.joinDate}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Status</span>
                          <span className="font-semibold text-emerald-600">{m.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Active Loans</span>
                      <span className="font-bold text-stone-900 bg-[#F5C451]/30 px-2.5 py-1 rounded-full">
                        {m.activeBorrows} / {m.maxBorrows}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CALENDAR / SCHEDULE VIEW */}
        {activeTab === 'calendar' && (
          <div className="relative z-10 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Reading Hall & Resource Schedule</h3>
            <p className="text-xs text-stone-500 mb-6">Reservation logs for discussion pods, seminar spaces, and workshops</p>

            <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
              <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No scheduled events or hall bookings</p>
              <p className="text-xs text-stone-400 mt-1">All library meeting spaces and reading pods are currently available.</p>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD NEW BOOK */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF8F2] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-stone-200 shadow-2xl relative">
            <button 
              onClick={() => setIsAddBookOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-semibold text-stone-900">Catalog New Book</h3>
            <p className="text-xs text-stone-500 mt-1">Add a new volume into the library database.</p>

            <form onSubmit={handleAddBook} className="mt-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-600 mb-1">Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Clean Code"
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Author *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Robert Martin"
                    value={newBook.author}
                    onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Category</label>
                  <select 
                    value={newBook.category}
                    onChange={e => setNewBook({ ...newBook, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Business">Business</option>
                    <option value="Fiction">Fiction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Total Copies</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newBook.totalCopies}
                    onChange={e => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">ISBN</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if empty"
                    value={newBook.isbn}
                    onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Cover Image URL (optional)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={newBook.cover}
                  onChange={e => setNewBook({ ...newBook, cover: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Description (optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Brief synopsis..."
                  value={newBook.description}
                  onChange={e => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddBookOpen(false)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-full bg-[#1C1D21] text-white hover:bg-stone-800 shadow-md font-semibold"
                >
                  Catalog Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW MEMBER */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF8F2] rounded-3xl p-6 md:p-8 max-w-md w-full border border-stone-200 shadow-2xl relative">
            <button 
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-semibold text-stone-900">Enroll New Member</h3>
            <p className="text-xs text-stone-500 mt-1">Register a new patron, student or faculty member.</p>

            <form onSubmit={handleAddMember} className="mt-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-600 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jane Doe"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. jane@institution.edu"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Member Role</label>
                  <select 
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Community Member">Community Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Max Borrow Limit</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={newMember.maxBorrows}
                    onChange={e => setNewMember({ ...newMember, maxBorrows: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Membership ID</label>
                <input 
                  type="text" 
                  placeholder="Auto-generated if empty"
                  value={newMember.membershipId}
                  onChange={e => setNewMember({ ...newMember, membershipId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-full bg-[#1C1D21] text-white hover:bg-stone-800 shadow-md font-semibold"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE LOAN / BORROW */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF8F2] rounded-3xl p-6 md:p-8 max-w-md w-full border border-stone-200 shadow-2xl relative">
            <button 
              onClick={() => setIsBorrowModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-semibold text-stone-900">Issue Book Loan</h3>
            <p className="text-xs text-stone-500 mt-1">Assign a cataloged copy to a registered member.</p>

            <form onSubmit={handleIssueBorrow} className="mt-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-600 mb-1">Select Book *</label>
                <select 
                  required
                  value={selectedBookForBorrow}
                  onChange={e => setSelectedBookForBorrow(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                >
                  <option value="">-- Choose Book --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies === 0}>
                      {b.title} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Select Member / Scholar *</label>
                <select 
                  required
                  value={selectedMemberForBorrow}
                  onChange={e => setSelectedMemberForBorrow(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-stone-900 text-sm focus:outline-none"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membershipId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                Standard circulation period: <strong>14 Days</strong>.
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-full bg-[#F5C451] hover:bg-[#e4b545] text-stone-900 font-semibold shadow-md"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
