import { lazy, Suspense } from 'react';
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
 *   setCurrentPage: Function,
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
    onUpdateProfile,
    onEditListing,
    onViewOwner,
    onMarkSupportRead,
    onBanUser,
    onCategoryClick,
    onSearch,
    setCurrentPage,
  } = props;

  function renderPage() {
    if (currentPage === 'login')
      return <LoginPage onLogin={onLogin} currentUser={currentUser} />;

    if (currentPage === 'listings')
      return (
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
      );

    if (currentPage === 'listing-detail')
      return (
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
      );

    if (currentPage === 'owner-profile')
      return (
        <OwnerProfilePage
          owner={selectedOwner}
          listings={enrichedListings}
          goTo={navigate}
          onSelectListing={onSelectListing}
          currentUser={currentUser}
          addToast={addToast}
        />
      );

    if (currentPage === 'message-composer')
      return (
        <MessageComposerPage
          listing={selectedListing}
          currentUser={currentUser}
          goTo={navigate}
          onSendMessage={onSendMessage}
        />
      );

    if (currentPage === 'create-listing') {
      if (!currentUser) {
        setCurrentPage('login');
        return null;
      }
      return (
        <CreateListingPage
          onAddListing={onAddListing}
          goTo={navigate}
          currentUser={currentUser}
          addToast={addToast}
        />
      );
    }

    if (currentPage === 'messages')
      return (
        <MessagesPage
          messages={messages}
          currentUser={currentUser}
          goTo={navigate}
          listings={enrichedListings}
          onSendMessage={onSendMessage}
          onOpen={onMarkMessagesRead}
          onReviewAdded={onReviewAdded}
          addToast={addToast}
        />
      );

    if (currentPage === 'profile')
      return (
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
        />
      );

    if (currentPage === 'admin')
      return (
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
        />
      );

    if (currentPage === 'edit-listing')
      return (
        <EditListingPage
          listing={editListing}
          onUpdateListing={onUpdateListing}
          goTo={navigate}
          currentUser={currentUser}
          addToast={addToast}
        />
      );

    if (currentPage === 'reset-password')
      return <ResetPasswordPage onDone={() => setCurrentPage('home')} />;

    if (currentPage === 'support')
      return <SupportPage goTo={navigate} currentUser={currentUser} />;

    if (currentPage === 'impressum') return <ImpressumPage goTo={navigate} />;
    if (currentPage === 'agb') return <AGBPage goTo={navigate} />;
    if (currentPage === 'datenschutz') return <DatenschutzPage goTo={navigate} />;

    // Default: home
    return (
      <HomePage
        goTo={navigate}
        listings={enrichedListings}
        loading={loading}
        currentUser={currentUser}
        onCategoryClick={onCategoryClick}
        onSearch={onSearch}
        onSelectListing={onSelectListing}
      />
    );
  }

  return (
    <PageErrorBoundary key={currentPage}>
      <Suspense fallback={Fallback}>
        {renderPage()}
      </Suspense>
    </PageErrorBoundary>
  );
}
