export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'Fiction' | 'Technology' | 'Design' | 'Science' | 'History' | 'Business';
  isbn: string;
  cover: string;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  publishedYear: number;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  membershipId: string;
  role: 'Student' | 'Faculty' | 'Researcher' | 'Community Member';
  activeBorrows: number;
  maxBorrows: number;
  joinDate: string;
  status: 'Active' | 'Delinquent' | 'Expired';
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

export interface ActivityTask {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  type: 'pickup' | 'inventory' | 'catalog' | 'renewal';
}

