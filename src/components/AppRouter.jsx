import { lazy, Suspense, useEffect, useMemo } from 'react';
import { C } from '../constants';
import PageErrorBoundary from './PageErrorBoundary';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ListingsPage = lazy(() => import('../pages/ListingsPage'));
const ListingDetailPage = lazy(() => import('../pages/ListingDetailPage'));
const MessageComposerPage = lazy(() => import('../pages/MessageComposerPage'));
const CreateListingPage = lazy(() => import('../pages/CreateListingPage'));
const EditListingPage = lazy(() => import('../pages/EditListingPage'));
const MessagesPage = lazy(() => import('../pages/MessagesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const OwnerProfilePage = lazy(() => import('../pages/OwnerProfilePage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ImpressumPage = lazy(() => import('../pages/ImpressumPage'));
const AGBPage = lazy(() => import('../pages/AGBPage'));
const DatenschutzPage = lazy(() => import('../pages/DatenschutzPage'));
const SupportPage = lazy(() => import('../pages/SupportPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const PROTECTED_PAGES = new Set(['create-listing', 'messages', 'profile']);

const Fallback = (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: C.muted,
    }}
  >
    Lädt…
  </div>
);

/**
 * @param {{
 *   currentPage: string,
 *   navigate: (page: string) => void,
 *   currentUser: import('../constants').UserProfile | null,
 *   profile: object | null,
 *   enrichedListings: import('../constants').Listing[],
 *   loading: boolean,
 *   selectedListing: object | null,
 *   favorites: string[],
 *   messages: import('../constants').Message[],
 *   bookings: import('../constants').Booking[],
 *   supportRequests: object[],
 *   handledBookings: object,
 *   editListing: object | null,
 *   selectedOwner: object | null,
 *   listingsInitCategory: string,
 *   listingsInitSearch: string,
 *   addToast: (text: string, type?: string) => void,
 *   onLogin: Function,
 *   onSelectListing: Function,
 *   onStartMessage: Function,
 *   onAddListing: Function,
 *   onUpdateListing: Function,
 *   onDeleteListing: Function,
 *   onToggleAvailability: Function,
 *   onBook: Function,
 *   onSendMessage: Function,
 *   onMarkMessagesRead: Function,
 *   onReviewAdded: Function,
 *   onAcceptBooking: Function,
 *   onDeclineBooking: Function,
 *   onAcceptBookingRecord: Function,
 *   onDeclineBookingRecord: Function,
 *   onUpdateProfile: Function,
 *   onEditListing: Function,
 *   onViewOwner: Function,
 *   onMarkSupportRead: Function,
 *   onBanUser: Function,
 *   onCategoryClick: Function,
 *   onSearch: Function,
 * }} props
 */
export default function AppRouter(props) {
  const {
    currentPage,
    navigate,
    currentUser,
    profile,
    enrichedListings,
    loading,
    selectedListing,
    favorites,
    toggleFavorite,
    messages,
    setMessages,
    hiddenThreads,
    setHiddenThreads,
    bookings,
    supportRequests,
    handledBookings,
    editListing,
    selectedOwner,
    listingsInitCategory,
    listingsInitSearch,
    addToast,
    onLogin,
    onSelectListing,
    onStartMessage,
    onAddListing,
    onUpdateListing,
    onDeleteListing,
    onToggleAvailability,
    onBook,
    onSendMessage,
    onMarkMessagesRead,
    onReviewAdded,
    onAcceptBooking,
    onDeclineBooking,
    onAcceptBookingRecord,
    onDeclineBookingRecord,
    onConfirmReturn,
    onUpdateProfile,
    onEditListing,
    onViewOwner,
    onMarkSupportRead,
    onBanUser,
    onCategoryClick,
    onSearch,
    hasMoreMessages,
    onLoadMoreMessages,
    onLogout,
  } = props;

  useEffect(() => {
    if (!currentUser && PROTECTED_PAGES.has(currentPage)) {
      navigate('login');
    }
  }, [currentPage, currentUser, navigate]);

  const routeMap = useMemo(
    () => ({
      login: () => <LoginPage onLogin={onLogin} currentUser={currentUser} goTo={navigate} />,
      listings: () => (
        <ListingsPage
          listings={enrichedListings}
          loading={loading}
          goTo={navigate}
          onSelectListing={onSelectListing}
          currentUser={currentUser}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          initCategory={listingsInitCategory}
          initSearch={listingsInitSearch}
        />
      ),
      'listing-detail': () => (
        <ListingDetailPage
          listing={enrichedListings.find((l) => l.id === selectedListing?.id) || selectedListing}
          goTo={navigate}
          currentUser={currentUser}
          onStartMessage={onStartMessage}
          allListings={enrichedListings}
          onSelectListing={onSelectListing}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToast={addToast}
          onEditListing={onEditListing}
          onDeleteListing={(id) => {
            onDeleteListing(id);
            navigate('listings');
          }}
          onReviewAdded={onReviewAdded}
          onToggleAvailability={onToggleAvailability}
          onViewOwner={onViewOwner}
          onBook={onBook}
        />
      ),
      'owner-profile': () => (
        <OwnerProfilePage
          owner={selectedOwner}
          listings={enrichedListings}
          goTo={navigate}
          onSelectListing={onSelectListing}
          currentUser={currentUser}
          addToast={addToast}
        />
      ),
      'message-composer': () => (
        <MessageComposerPage
          listing={selectedListing}
          currentUser={currentUser}
          goTo={navigate}
          onSendMessage={onSendMessage}
        />
      ),
      'create-listing': () => (
        <CreateListingPage
          onAddListing={onAddListing}
          goTo={navigate}
          currentUser={currentUser}
          addToast={addToast}
        />
      ),
      messages: () => (
        <MessagesPage
          messages={messages}
          setMessages={setMessages}
          hiddenThreads={hiddenThreads}
          setHiddenThreads={setHiddenThreads}
          currentUser={currentUser}
          goTo={navigate}
          listings={enrichedListings}
          onSendMessage={onSendMessage}
          onOpen={onMarkMessagesRead}
          onReviewAdded={onReviewAdded}
          addToast={addToast}
          hasMoreMessages={hasMoreMessages}
          onLoadMoreMessages={onLoadMoreMessages}
        />
      ),
      profile: () => (
        <ProfilePage
          currentUser={currentUser}
          profile={profile}
          listings={enrichedListings}
          messages={messages}
          favorites={favorites}
          goTo={navigate}
          onSelectListing={onSelectListing}
          onDeleteListing={onDeleteListing}
          onEditListing={onEditListing}
          onUpdateProfile={onUpdateProfile}
          onAcceptBooking={onAcceptBooking}
          onDeclineBooking={onDeclineBooking}
          handledBookings={handledBookings}
          addToast={addToast}
          bookings={bookings}
          onAcceptBookingRecord={onAcceptBookingRecord}
          onDeclineBookingRecord={onDeclineBookingRecord}
          onConfirmReturn={onConfirmReturn}
          onLogout={onLogout}
        />
      ),
      admin: () => (
        <AdminPage
          currentUser={currentUser}
          profile={profile}
          goTo={navigate}
          addToast={addToast}
          listings={enrichedListings}
          onDeleteListing={onDeleteListing}
          supportRequests={supportRequests}
          onMarkSupportRead={onMarkSupportRead}
          onBanUser={onBanUser}
          onViewOwner={onViewOwner}
        />
      ),
      'edit-listing': () => (
        <EditListingPage
          listing={editListing}
          onUpdateListing={onUpdateListing}
          goTo={navigate}
          currentUser={currentUser}
          addToast={addToast}
        />
      ),
      'reset-password': () => <ResetPasswordPage onDone={() => navigate('home')} />,
      support: () => <SupportPage goTo={navigate} currentUser={currentUser} />,
      impressum: () => <ImpressumPage goTo={navigate} />,
      agb: () => <AGBPage goTo={navigate} />,
      datenschutz: () => <DatenschutzPage goTo={navigate} />,
      '404': () => <NotFoundPage goTo={navigate} />,
      home: () => (
        <HomePage
          goTo={navigate}
          listings={enrichedListings}
          loading={loading}
          currentUser={currentUser}
          onCategoryClick={onCategoryClick}
          onSearch={onSearch}
          onSelectListing={onSelectListing}
        />
      ),
    }),
    [
      addToast,
      bookings,
      currentUser,
      editListing,
      enrichedListings,
      favorites,
      handledBookings,
      hiddenThreads,
      listingsInitCategory,
      listingsInitSearch,
      loading,
      messages,
      navigate,
      onAcceptBooking,
      onAcceptBookingRecord,
      onAddListing,
      onBanUser,
      onBook,
      onDeclineBooking,
      onDeclineBookingRecord,
      onDeleteListing,
      onEditListing,
      onLogin,
      onMarkMessagesRead,
      onMarkSupportRead,
      onReviewAdded,
      onSearch,
      onSelectListing,
      onSendMessage,
      onStartMessage,
      onToggleAvailability,
      onUpdateListing,
      onUpdateProfile,
      onViewOwner,
      onConfirmReturn,
      profile,
      selectedListing,
      selectedOwner,
      setHiddenThreads,
      setMessages,
      supportRequests,
      toggleFavorite,
      onCategoryClick,
    ]
  );

  function renderPage() {
    if (!currentUser && PROTECTED_PAGES.has(currentPage)) return null;
    const renderer = routeMap[currentPage];
    if (!renderer) return routeMap['404']();
    return renderer();
  }

  return (
    <PageErrorBoundary key={currentPage}>
      <Suspense fallback={Fallback}>
        <div key={currentPage} className="ria-page-enter">
          {renderPage()}
        </div>
      </Suspense>
    </PageErrorBoundary>
  );
}
