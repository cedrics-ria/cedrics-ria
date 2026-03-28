import { useEffect, useMemo, useRef, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import EmptyState from '../components/EmptyState';
import ReviewModal from '../components/ReviewModal';
import HandoverProtocolModal from '../components/HandoverProtocolModal';
import { supabase } from '../supabase';

export default function MessagesPage({
  messages,
  currentUser,
  goTo,
  listings,
  onSendMessage,
  onOpen,
  onReviewAdded,
  addToast,
}) {
  const [openThread, setOpenThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // { listingId, listingTitle, revieweeId, revieweeName }
  const [handoverModal, setHandoverModal] = useState(null); // { listingId, listingTitle, otherUserId, otherUserName }
  const [reviewedThreads, setReviewedThreads] = useState({}); // listingId -> true if current user already reviewed
  const [handoverProtocols, setHandoverProtocols] = useState({}); // listingId -> protocol obj or null

  // Stable ref so the effect runs only once on mount, regardless of onOpen identity
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    if (onOpenRef.current) onOpenRef.current();
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Group messages into threads by listing
  const threads = useMemo(() => {
    const map = {};
    messages.forEach((msg) => {
      const key = String(msg.listingId);
      if (!map[key]) {
        map[key] = {
          key,
          listingId: msg.listingId,
          listingTitle: msg.listingTitle,
          otherName: null,
          otherUserId: null,
          msgs: [],
        };
      }
      if (msg.fromUserId !== currentUser?.id && !map[key].otherName) {
        map[key].otherName = msg.fromName;
        map[key].otherUserId = msg.fromUserId;
      }
      map[key].msgs.push(msg);
    });
    return Object.values(map)
      .map((t) => {
        // If we started the conversation and haven't got a reply yet, look up listing owner
        let otherName = t.otherName;
        let otherUserId = t.otherUserId;
        if (!otherName) {
          const relListing = listings.find((l) => String(l.id) === t.key);
          if (relListing) {
            otherName = relListing.ownerName || 'Verleiher';
            if (!otherUserId) otherUserId = relListing.userId;
          }
        }
        return {
          ...t,
          otherName: otherName || 'Konversation',
          otherUserId,
          msgs: [...t.msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
          lastAt: t.msgs.reduce(
            (mx, m) => (new Date(m.createdAt) > new Date(mx) ? m.createdAt : mx),
            '0'
          ),
          unread: t.msgs.filter((m) => m.toUserId === currentUser?.id).length,
        };
      })
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  }, [messages, currentUser, listings]);

  const active = threads.find((t) => t.key === openThread);

  // When a thread is opened, check if booking was accepted and load review/protocol status
  useEffect(() => {
    if (!openThread || !currentUser) return;
    const thread = threads.find((t) => t.key === openThread);
    if (!thread) return;

    const hasAccepted = thread.msgs.some(
      (m) => m.text && m.text.includes('Buchungsanfrage angenommen')
    );
    if (!hasAccepted) return;

    // Check if already reviewed
    (async () => {
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id')
        .eq('listing_id', String(thread.listingId))
        .eq('reviewer_id', currentUser.id)
        .limit(1);
      if (reviewData && reviewData.length > 0) {
        setReviewedThreads((prev) => ({ ...prev, [openThread]: true }));
      }

      // Check if protocol exists
      const { data: protocolData } = await supabase
        .from('handover_protocols')
        .select('*')
        .eq('listing_id', String(thread.listingId))
        .or(`lender_id.eq.${currentUser.id},borrower_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (protocolData) {
        setHandoverProtocols((prev) => ({ ...prev, [openThread]: protocolData }));
      }
    })();
  }, [openThread]);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !active) return;
    setSending(true);
    const ok = await onSendMessage({
      listingId: active.listingId,
      listingTitle: active.listingTitle,
      toUserId: active.otherUserId,
      text: replyText.trim(),
    });
    setSending(false);
    if (ok) setReplyText('');
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Gerade eben';
    if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min`;
    if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std`;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  }

  function openReviewModal(thread) {
    setReviewModal({
      listingId: thread.listingId,
      listingTitle: thread.listingTitle,
      revieweeId: thread.otherUserId,
      revieweeName: thread.otherName,
    });
  }

  function openHandoverModal(thread) {
    setHandoverModal({
      listingId: thread.listingId,
      listingTitle: thread.listingTitle,
      otherUserId: thread.otherUserId,
      otherUserName: thread.otherName,
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.sage,
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Posteingang
        </p>
        <h1
          style={{
            fontSize: '2.8rem',
            color: C.forest,
            marginTop: 0,
            marginBottom: '1.75rem',
            letterSpacing: '-0.03em',
          }}
        >
          Nachrichten
        </h1>

        {threads.length === 0 ? (
          <EmptyState
            title="Noch keine Nachrichten"
            text="Schreib einem Verleiher oder erstelle ein Inserat, um Anfragen zu bekommen."
            buttonLabel="Inserate durchsuchen"
            onClick={() => goTo('listings')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {threads.map((thread) => {
              const isOpen = openThread === thread.key;
              const lastMsg = thread.msgs[thread.msgs.length - 1];
              const isAccepted = thread.msgs.some(
                (m) => m.text && m.text.includes('Buchungsanfrage angenommen')
              );
              const alreadyReviewed = reviewedThreads[thread.key];
              const hasProtocol = handoverProtocols[thread.key];

              return (
                <div
                  key={thread.key}
                  style={{
                    background: 'white',
                    borderRadius: 20,
                    border: `1px solid ${isOpen ? C.sage : C.line}`,
                    boxShadow: isOpen ? '0 8px 32px rgba(28,58,46,0.12)' : C.shadow,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Thread header */}
                  <button
                    onClick={() => setOpenThread(isOpen ? null : thread.key)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(thread.otherName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.2rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: C.forest, fontSize: '0.95rem' }}>
                          {thread.otherName || 'Konversation'}
                        </span>
                        <span
                          style={{
                            background: C.sageLight,
                            color: C.forest,
                            padding: '0.15rem 0.55rem',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {thread.listingTitle}
                        </span>
                        {isAccepted && (
                          <span
                            style={{
                              background: 'rgba(122,158,126,0.2)',
                              color: C.forest,
                              padding: '0.12rem 0.55rem',
                              borderRadius: 999,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ✓ Angenommen
                          </span>
                        )}
                        {thread.unread > 0 && !isOpen && (
                          <span
                            style={{
                              background: C.terra,
                              color: 'white',
                              borderRadius: 999,
                              padding: '0.1rem 0.45rem',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                            }}
                          >
                            {thread.unread}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {lastMsg.text}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.4rem',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: C.muted }}>
                        {formatDate(thread.lastAt)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: C.muted,
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Thread messages */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${C.line}` }}>
                      <div
                        style={{
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                          maxHeight: 380,
                          overflowY: 'auto',
                        }}
                      >
                        {thread.msgs.map((msg) => {
                          const isMine = msg.fromUserId === currentUser?.id;
                          return (
                            <div
                              key={msg.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <div
                                style={{
                                  maxWidth: '80%',
                                  background: isMine ? C.forest : C.sageLight,
                                  color: isMine ? 'white' : C.ink,
                                  padding: '0.75rem 1rem',
                                  borderRadius: isMine
                                    ? '16px 16px 4px 16px'
                                    : '16px 16px 16px 4px',
                                  fontSize: '0.92rem',
                                  lineHeight: 1.65,
                                }}
                              >
                                {msg.text}
                              </div>
                              <span
                                style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.3rem' }}
                              >
                                {isMine ? 'Du' : msg.fromName} · {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Handover protocol summary in thread */}
                      {hasProtocol && (
                        <div
                          style={{
                            margin: '0 1.5rem 1rem',
                            background: C.sageLight,
                            borderRadius: 14,
                            padding: '0.9rem 1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>📋</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: C.forest, fontSize: '0.88rem' }}>
                              Übergabeprotokoll vorhanden
                            </div>
                            <div style={{ fontSize: '0.8rem', color: C.muted }}>
                              Übergabe am{' '}
                              {new Date(hasProtocol.handover_date).toLocaleDateString('de-DE')} ·
                              Zustand: {hasProtocol.condition.slice(0, 60)}
                              {hasProtocol.condition.length > 60 ? '…' : ''}
                            </div>
                          </div>
                          <button
                            onClick={() => openHandoverModal(thread)}
                            style={{
                              background: 'white',
                              color: C.forest,
                              border: `1px solid ${C.line}`,
                              borderRadius: 10,
                              padding: '0.45rem 0.8rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Ansehen
                          </button>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div
                        style={{
                          borderTop: `1px solid ${C.line}`,
                          padding: '0.85rem 1.5rem',
                          background: 'rgba(234,240,235,0.5)',
                          display: 'flex',
                          gap: '0.65rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {isAccepted &&
                          (!alreadyReviewed ? (
                            <button
                              onClick={() => openReviewModal(thread)}
                              style={{
                                padding: '0.6rem 1rem',
                                borderRadius: 12,
                                border: `1px solid ${C.sage}`,
                                background: 'white',
                                color: C.forest,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              ⭐ Bewertung abgeben
                            </button>
                          ) : (
                            <span
                              style={{
                                padding: '0.6rem 1rem',
                                borderRadius: 12,
                                background: C.sageLight,
                                color: C.sage,
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              ✓ Bewertet
                            </span>
                          ))}
                        {!hasProtocol ? (
                          <button
                            onClick={() => openHandoverModal(thread)}
                            style={{
                              padding: '0.6rem 1rem',
                              borderRadius: 12,
                              border: `1px solid ${C.line}`,
                              background: 'white',
                              color: C.forest,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            📋 Übergabeprotokoll erstellen
                          </button>
                        ) : (
                          <button
                            onClick={() => openHandoverModal(thread)}
                            style={{
                              padding: '0.6rem 1rem',
                              borderRadius: 12,
                              border: `1px solid ${C.sage}`,
                              background: C.sageLight,
                              color: C.forest,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            📋 Protokoll ansehen
                          </button>
                        )}
                      </div>

                      {/* Reply */}
                      {active?.otherUserId && (
                        <form
                          onSubmit={handleReply}
                          style={{
                            borderTop: `1px solid ${C.line}`,
                            padding: '1rem 1.5rem',
                            background: C.sageLight,
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-end',
                          }}
                        >
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Antwort an ${thread.otherName || 'Verleiher'}…`}
                            rows={2}
                            onFocus={applyInputFocus}
                            onBlur={resetInputFocus}
                            style={{
                              ...inputBaseStyle,
                              flex: 1,
                              resize: 'none',
                              fontSize: '0.9rem',
                            }}
                          />
                          <button
                            type="submit"
                            disabled={sending || !replyText.trim()}
                            style={{
                              ...primaryButtonStyle,
                              padding: '0.75rem 1.1rem',
                              fontSize: '0.88rem',
                              flexShrink: 0,
                              opacity: !replyText.trim() || sending ? 0.6 : 1,
                            }}
                          >
                            {sending ? '…' : 'Senden'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          listingId={reviewModal.listingId}
          listingTitle={reviewModal.listingTitle}
          revieweeId={reviewModal.revieweeId}
          revieweeName={reviewModal.revieweeName}
          currentUser={currentUser}
          addToast={addToast || (() => {})}
          onReviewAdded={(listingId, rating) => {
            setReviewedThreads((prev) => ({ ...prev, [String(listingId)]: true }));
            if (onReviewAdded) onReviewAdded(listingId, rating);
          }}
          onClose={() => setReviewModal(null)}
        />
      )}

      {/* Handover Protocol Modal */}
      {handoverModal && (
        <HandoverProtocolModal
          listingId={handoverModal.listingId}
          listingTitle={handoverModal.listingTitle}
          otherUserId={handoverModal.otherUserId}
          otherUserName={handoverModal.otherUserName}
          currentUser={currentUser}
          addToast={addToast || (() => {})}
          onClose={() => {
            // Reload protocol status after closing
            const thread = threads.find(
              (t) => String(t.listingId) === String(handoverModal.listingId)
            );
            if (thread) {
              supabase
                .from('handover_protocols')
                .select('*')
                .eq('listing_id', String(handoverModal.listingId))
                .or(`lender_id.eq.${currentUser.id},borrower_id.eq.${currentUser.id}`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setHandoverProtocols((prev) => ({ ...prev, [thread.key]: data }));
                  }
                });
            }
            setHandoverModal(null);
          }}
        />
      )}
    </div>
  );
}
