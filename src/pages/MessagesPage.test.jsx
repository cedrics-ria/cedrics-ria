import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MessagesPage from './MessagesPage';

const resolveEmpty = Promise.resolve({});
const updateChain = {
  eq: vi.fn(() => updateChain),
  then: resolveEmpty.then.bind(resolveEmpty),
};

vi.mock('../supabase', () => ({
  supabase: {
    from: (table) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: [] }),
          }),
        };
      }
      return { update: vi.fn(() => updateChain) };
    },
  },
}));

vi.mock('../components/ReviewModal', () => ({ default: () => null }));
vi.mock('../components/HandoverProtocolModal', () => ({ default: () => null }));
vi.mock('../components/ContractModal', () => ({ default: () => null }));

function buildProps(overrides = {}) {
  return {
    messages: [],
    setMessages: vi.fn(),
    hiddenThreads: new Set(),
    setHiddenThreads: vi.fn(),
    currentUser: { id: 'owner-1', name: 'Owner' },
    goTo: vi.fn(),
    listings: [{ id: 'listing-1', title: 'Bohrmaschine', userId: 'owner-1', ownerName: 'Owner' }],
    onSendMessage: vi.fn(),
    onOpen: vi.fn(),
    onReviewAdded: vi.fn(),
    addToast: vi.fn(),
    ...overrides,
  };
}

describe('MessagesPage threading', () => {
  it('marks only the opened thread as read', async () => {
    updateChain.eq.mockClear();

    const messages = [
      {
        id: 'm1',
        listingId: 'listing-1',
        listingTitle: 'Bohrmaschine',
        fromUserId: 'user-b',
        fromName: 'Ben',
        toUserId: 'owner-1',
        text: 'Nachricht von Ben',
        createdAt: '2026-03-30T10:00:00.000Z',
        read: false,
      },
      {
        id: 'm2',
        listingId: 'listing-1',
        listingTitle: 'Bohrmaschine',
        fromUserId: 'user-c',
        fromName: 'Clara',
        toUserId: 'owner-1',
        text: 'Nachricht von Clara',
        createdAt: '2026-03-30T11:00:00.000Z',
        read: false,
      },
    ];

    render(<MessagesPage {...buildProps({ messages })} />);

    fireEvent.click(await screen.findByText('Ben'));

    expect(updateChain.eq.mock.calls[0]).toEqual(['to_user_id', 'owner-1']);
    expect(updateChain.eq.mock.calls[1]).toEqual(['listing_id', 'listing-1']);
    expect(updateChain.eq.mock.calls[2]).toEqual(['from_user_id', 'user-b']);
    expect(updateChain.eq.mock.calls[3]).toEqual(['read', false]);
  });

  it('shows separate threads for same listing with different users', async () => {
    const messages = [
      {
        id: 'm1',
        listingId: 'listing-1',
        listingTitle: 'Bohrmaschine',
        fromUserId: 'user-b',
        fromName: 'Ben',
        toUserId: 'owner-1',
        text: 'Ist sie noch frei?',
        createdAt: '2026-03-30T10:00:00.000Z',
        read: false,
      },
      {
        id: 'm2',
        listingId: 'listing-1',
        listingTitle: 'Bohrmaschine',
        fromUserId: 'user-c',
        fromName: 'Clara',
        toUserId: 'owner-1',
        text: 'Kann ich morgen ausleihen?',
        createdAt: '2026-03-30T11:00:00.000Z',
        read: false,
      },
    ];

    render(<MessagesPage {...buildProps({ messages })} />);

    expect(await screen.findByText('Ben')).toBeInTheDocument();
    expect(await screen.findByText('Clara')).toBeInTheDocument();
    expect(screen.getAllByText('Bohrmaschine')).toHaveLength(2);
  });
});
