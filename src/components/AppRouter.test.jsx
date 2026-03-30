import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppRouter from './AppRouter';

vi.mock('../components/PageErrorBoundary', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('../pages/LoginPage', () => ({
  default: function MockLoginPage() {
    return <div>Mock Login Page</div>;
  },
}));

vi.mock('../pages/HomePage', () => ({
  default: function MockHomePage() {
    return <div>Mock Home Page</div>;
  },
}));

function buildProps(overrides = {}) {
  return {
    currentPage: 'home',
    navigate: vi.fn(),
    currentUser: null,
    profile: null,
    enrichedListings: [],
    loading: false,
    selectedListing: null,
    favorites: [],
    toggleFavorite: vi.fn(),
    messages: [],
    setMessages: vi.fn(),
    hiddenThreads: new Set(),
    setHiddenThreads: vi.fn(),
    bookings: [],
    supportRequests: [],
    handledBookings: {},
    editListing: null,
    selectedOwner: null,
    listingsInitCategory: '',
    listingsInitSearch: '',
    addToast: vi.fn(),
    onLogin: vi.fn(),
    onSelectListing: vi.fn(),
    onStartMessage: vi.fn(),
    onAddListing: vi.fn(),
    onUpdateListing: vi.fn(),
    onDeleteListing: vi.fn(),
    onToggleAvailability: vi.fn(),
    onBook: vi.fn(),
    onSendMessage: vi.fn(),
    onMarkMessagesRead: vi.fn(),
    onReviewAdded: vi.fn(),
    onAcceptBooking: vi.fn(),
    onDeclineBooking: vi.fn(),
    onAcceptBookingRecord: vi.fn(),
    onDeclineBookingRecord: vi.fn(),
    onConfirmReturn: vi.fn(),
    onUpdateProfile: vi.fn(),
    onEditListing: vi.fn(),
    onViewOwner: vi.fn(),
    onMarkSupportRead: vi.fn(),
    onBanUser: vi.fn(),
    onCategoryClick: vi.fn(),
    onSearch: vi.fn(),
    ...overrides,
  };
}

describe('AppRouter', () => {
  it('redirects unauthenticated users from protected pages', async () => {
    const navigate = vi.fn();
    render(<AppRouter {...buildProps({ currentPage: 'messages', navigate })} />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('login');
    });
    expect(screen.queryByText('Mock Login Page')).not.toBeInTheDocument();
  });

  it('renders login route without forcing redirect', async () => {
    const navigate = vi.fn();
    render(<AppRouter {...buildProps({ currentPage: 'login', navigate })} />);

    expect(await screen.findByText('Mock Login Page')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith('login');
  });

  it('falls back to home route for unknown pages', async () => {
    render(<AppRouter {...buildProps({ currentPage: 'does-not-exist' })} />);
    expect(await screen.findByText('Mock Home Page')).toBeInTheDocument();
  });
});
