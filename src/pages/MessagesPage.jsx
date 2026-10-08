import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { inquiryService } from '../services/inquiryService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import { DEFAULT_PLACEHOLDER_IMAGE, getCategoryPlaceholder } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Tag,
  ExternalLink,
  Search,
  CheckCheck,
  Clock,
  Sparkles,
  AlertCircle,
  Inbox,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Filter,
  Check,
  Package
} from 'lucide-react';

const SELLER_QUICK_CHIPS = [
  '👋 Hi! Yes, this item is still available!',
  '📍 Can meet at campus library lobby today',
  '🕒 What time works best for you?',
  '💵 I can do this price for quick campus pickup',
  '✅ Let me know when you arrive on campus!',
];

const BUYER_QUICK_CHIPS = [
  '👋 Hi! Is this still available?',
  '📍 Can we meet at the campus library?',
  '🕒 What time works best for you today?',
  '💵 Would you accept cash or Venmo?',
  '📚 What edition or condition is this in?',
];

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlInquiryId = searchParams.get('inquiryId');
  const urlListingId = searchParams.get('listingId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const activeConvRef = useRef(null);
  activeConvRef.current = activeConv;

  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'BUYING' | 'SELLING'
  const [selectedListingFilter, setSelectedListingFilter] = useState(urlListingId || 'ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync selectedListingFilter when urlListingId changes
  useEffect(() => {
    if (urlListingId) {
      setSelectedListingFilter(urlListingId);
    }
  }, [urlListingId]);

  // Fetch all conversations
  const fetchConversations = async (keepActive = true) => {
    try {
      const data = await inquiryService.getAllConversations();
      const convList = data || [];
      setConversations(convList);

      if (convList.length > 0) {
        // Priority 1: URL inquiryId match
        if (urlInquiryId) {
          const matched = convList.find((c) => String(c.id) === String(urlInquiryId));
          if (matched) {
            loadActiveThread(matched.id, false);
            return;
          }
        }

        // Priority 2: URL listingId match
        if (urlListingId) {
          const listingMatch = convList.find((c) => String(c.listingId) === String(urlListingId));
          if (listingMatch) {
            loadActiveThread(listingMatch.id, false);
            return;
          }
        }

        // Priority 3: Keep active conversation if it still exists
        if (keepActive && activeConvRef.current) {
          const stillThere = convList.find((c) => c.id === activeConvRef.current.id);
          if (stillThere) {
            // Keep current thread active
            return;
          }
        }

        // Default: load the first conversation
        loadActiveThread(convList[0].id, false);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Could not load your messages. Please check network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load a specific conversation thread
  const loadActiveThread = async (inquiryId, updateUrl = true) => {
    setLoadingThread(true);
    try {
      const thread = await inquiryService.getConversation(inquiryId);
      setActiveConv(thread);
      activeConvRef.current = thread;

      if (updateUrl) {
        const nextParams = { inquiryId: String(inquiryId) };
        if (selectedListingFilter !== 'ALL') {
          nextParams.listingId = String(selectedListingFilter);
        }
        setSearchParams(nextParams);
      }
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      setLoadingThread(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(false);
  }, []);

  // Poll for new messages every 4 seconds without resetting user's active thread
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // 1. Silently update conversation list in background
        const freshList = await inquiryService.getAllConversations();
        if (freshList && freshList.length > 0) {
          setConversations(freshList);
        }

        // 2. Silently refresh current thread replies if active
        const currentActive = activeConvRef.current;
        if (currentActive && currentActive.id) {
          const freshThread = await inquiryService.getConversation(currentActive.id);
          if (
            freshThread &&
            freshThread.replies &&
            freshThread.replies.length !== (currentActive.replies?.length || 0)
          ) {
            setActiveConv(freshThread);
            activeConvRef.current = freshThread;
            scrollToBottom();
          }
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Send reply handler
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeConv || sending) return;

    setSending(true);
    const textToSend = replyText.trim();
    setReplyText('');

    try {
      const updated = await inquiryService.sendReply(activeConv.id, { message: textToSend });
      setActiveConv(updated);
      activeConvRef.current = updated;

      // Update snippet in conversation list immediately
      setConversations((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? { ...c, lastMessage: textToSend, updatedAt: new Date().toISOString() }
            : c
        )
      );
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
      setReplyText(textToSend); // Restore unsent message
    } finally {
      setSending(false);
    }
  };

  // Calculate seller and buyer splits
  const sellerConversations = conversations.filter((c) => !c.buyer);
  const buyerConversations = conversations.filter((c) => c.buyer);

  // Group listings owned by this seller that have inquiries
  const sellerListingsMap = new Map();
  sellerConversations.forEach((c) => {
    if (!sellerListingsMap.has(c.listingId)) {
      sellerListingsMap.set(c.listingId, {
        id: c.listingId,
        title: c.listingTitle,
        price: c.listingPrice,
        category: c.listingCategory,
        buyerCount: 0,
      });
    }
    sellerListingsMap.get(c.listingId).buyerCount += 1;
  });
  const sellerListings = Array.from(sellerListingsMap.values());

  // Filter conversations for the sidebar
  const filteredConversations = conversations.filter((c) => {
    // Role tab filter
    if (filterTab === 'BUYING' && !c.buyer) return false;
    if (filterTab === 'SELLING' && c.buyer) return false;

    // Listing filter
    if (selectedListingFilter !== 'ALL' && String(c.listingId) !== String(selectedListingFilter)) {
      return false;
    }

    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = c.listingTitle?.toLowerCase().includes(q);
      const matchPerson = c.otherPartyName?.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.toLowerCase().includes(q);
      return matchTitle || matchPerson || matchMsg;
    }
    return true;
  });

  // Multiple buyers for the active thread's listing (when user is seller)
  const otherBuyersForListing =
    activeConv && !activeConv.buyer
      ? sellerConversations.filter((c) => c.listingId === activeConv.listingId)
      : [];

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchConversations(true);
  };

  const currentChips =
    activeConv && !activeConv.buyer ? SELLER_QUICK_CHIPS : BUYER_QUICK_CHIPS;

  return (
    <div style={{ padding: '2rem 0 4rem 0', minHeight: '85vh', backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Header Bar */}
        <div
          style={{
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <MessageSquare size={22} />
              </div>
              <h1 style={{ fontSize: '1.85rem', margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Buyer-Seller Direct Chat &amp; Inquiries
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0.25rem 0 0 0' }}>
              Manage chats with different buyers separately, respond with one click, and coordinate safe campus meetups.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#ffffff' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Messages'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              color: '#b91c1c',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Listing Filter Banner (if filtering by a specific listing) */}
        {selectedListingFilter !== 'ALL' && (
          <div
            style={{
              backgroundColor: '#f4f4f5',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '0.65rem 1.15rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#09090b', fontSize: '0.9rem', fontWeight: 600 }}>
              <Filter size={16} />
              <span>
                Filtered to listing: <strong>{conversations.find((c) => String(c.listingId) === String(selectedListingFilter))?.listingTitle || `Item #${selectedListingFilter}`}</strong>
              </span>
              <span style={{ backgroundColor: '#09090b', color: '#ffffff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {filteredConversations.length} {filteredConversations.length === 1 ? 'buyer chat' : 'buyer chats'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedListingFilter('ALL');
                const nextParams = {};
                if (activeConv) nextParams.inquiryId = String(activeConv.id);
                setSearchParams(nextParams);
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #93c5fd',
                color: '#1d4ed8',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
              }}
            >
              Show All Listings
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0' }}>
            <LoadingSpinner message="Loading your direct buyer-seller messages..." />
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State */
          <div
            className="card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '3rem auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid #e4e4e7',
              }}
            >
              <Inbox size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Conversations Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              When buyers inquire about your items, or when you message sellers on campus, your direct chat threads with complete chat history will appear right here!
            </p>
            <Link to="/browse" className="btn btn-primary btn-lg">
              <Sparkles size={16} /> Browse Items to Inquire
            </Link>
          </div>
        ) : (
          /* Main Two-Column Chat Hub */
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: '380px 1fr',
              minHeight: '700px',
              height: 'calc(85vh - 90px)',
              maxHeight: '900px',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
            }}
          >
            {/* Left Sidebar: Conversations List */}
            <div
              style={{
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Role Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '0.4rem',
                  gap: '0.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setFilterTab('ALL')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: filterTab === 'ALL' ? 700 : 500,
                    backgroundColor: filterTab === 'ALL' ? '#ffffff' : 'transparent',
                    color: filterTab === 'ALL' ? '#09090b' : '#71717a',
                    boxShadow: filterTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  All ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('SELLING')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: filterTab === 'SELLING' ? 700 : 500,
                    backgroundColor: filterTab === 'SELLING' ? '#ffffff' : 'transparent',
                    color: filterTab === 'SELLING' ? '#09090b' : '#71717a',
                    boxShadow: filterTab === 'SELLING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Buyer Chats ({sellerConversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('BUYING')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: filterTab === 'BUYING' ? 700 : 500,
                    backgroundColor: filterTab === 'BUYING' ? '#ffffff' : 'transparent',
                    color: filterTab === 'BUYING' ? '#09090b' : '#71717a',
                    boxShadow: filterTab === 'BUYING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  My Inquiries ({buyerConversations.length})
                </button>
              </div>

              {/* Seller Listing Filter Selector (if seller has listings with chats) */}
              {sellerListings.length > 0 && filterTab !== 'BUYING' && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f1f5f9',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Package size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                    Item:
                  </span>
                  <select
                    value={selectedListingFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedListingFilter(val);
                      const nextParams = {};
                      if (val !== 'ALL') nextParams.listingId = val;
                      if (activeConv) nextParams.inquiryId = String(activeConv.id);
                      setSearchParams(nextParams);
                    }}
                    style={{
                      flex: 1,
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="ALL">All Items ({conversations.length} chats)</option>
                    {sellerListings.map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.title} ({l.buyerCount} {l.buyerCount === 1 ? 'buyer' : 'buyers'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search Bar in Sidebar */}
              <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search buyer name or item..."
                    className="form-input"
                    style={{
                      paddingLeft: '32px',
                      paddingTop: '0.35rem',
                      paddingBottom: '0.35rem',
                      fontSize: '0.825rem',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>

              {/* Conversations Scrollable List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No conversations match this filter.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activeConv?.id === c.id;
                    const isSellerView = !c.buyer; // Current user is seller; c.otherPartyName is the BUYER!

                    return (
                      <div
                        key={c.id}
                        onClick={() => loadActiveThread(c.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f4f4f5' : 'transparent',
                          borderLeft: isSelected ? '4px solid #09090b' : '4px solid transparent',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* Avatar / Thumbnail */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img
                            src={c.listingImageUrl || getCategoryPlaceholder(c.listingCategory)}
                            alt={c.listingTitle}
                            referrerPolicy="no-referrer"
                            style={{
                              width: '46px',
                              height: '46px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                            }}
                            onError={(e) => {
                              e.target.src = getCategoryPlaceholder(c.listingCategory);
                            }}
                          />
                          {isSellerView && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: '#09090b',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                border: '1.5px solid #ffffff',
                              }}
                              title="Buyer Inquiry"
                            >
                              <User size={10} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Row 1: Primary Header & Timestamp */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              marginBottom: '0.2rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: isSelected ? '#312e81' : '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {isSellerView ? `👤 ${c.otherPartyName}` : c.listingTitle}
                              </span>
                            </div>

                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                              {formatDate(c.lastMessageTime || c.createdAt)}
                            </span>
                          </div>

                          {/* Row 2: Listing Context Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: isSellerView ? '#f4f4f5' : '#fafafa',
                                color: '#09090b',
                                border: '1px solid #e4e4e7',
                              }}
                            >
                              {isSellerView ? 'Buyer Inquiry' : `Seller: ${c.otherPartyName}`}
                            </span>

                            {isSellerView && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '140px',
                                }}
                                title={c.listingTitle}
                              >
                                🏷️ {c.listingTitle}
                              </span>
                            )}
                          </div>

                          {/* Row 3: Last Message Snippet */}
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: isSelected ? '#4338ca' : '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.4,
                            }}
                          >
                            {c.lastMessage || c.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Active Chat Room */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              {activeConv ? (
                <>
                  {/* Chat Top Header */}
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Other User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#f4f4f5',
                          color: '#09090b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.15rem',
                          border: '1px solid #e4e4e7',
                        }}
                      >
                        {activeConv.otherPartyName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                            {activeConv.buyer ? `Seller: ${activeConv.otherPartyName}` : `Buyer: ${activeConv.otherPartyName}`}
                          </span>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f4f4f5',
                              color: '#09090b',
                              border: '1px solid #e4e4e7',
                            }}
                          >
                            {activeConv.otherPartyRole}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.785rem', color: '#64748b' }}>
                          {activeConv.buyer ? activeConv.receiverEmail : activeConv.senderEmail}
                          {activeConv.contactInfo && (
                            <span style={{ marginLeft: '0.5rem', color: '#475569' }}>
                              • Contact: <strong>{activeConv.contactInfo}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Listing Preview Pill on Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <img
                        src={activeConv.listingImageUrl || getCategoryPlaceholder(activeConv.listingCategory)}
                        alt={activeConv.listingTitle}
                        referrerPolicy="no-referrer"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.src = getCategoryPlaceholder(activeConv.listingCategory);
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {activeConv.listingTitle}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#09090b', fontWeight: 800 }}>
                          {formatPrice(activeConv.listingPrice)}
                        </div>
                      </div>
                      <Link
                        to={`/listings/${activeConv.listingId}`}
                        style={{
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '0.25rem',
                        }}
                        title="View Full Listing"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </div>

                  {/* MULTI-BUYER SWITCHER BANNER: When user is seller & multiple buyers inquired about this item */}
                  {!activeConv.buyer && otherBuyersForListing.length > 1 && (
                    <div
                      style={{
                        padding: '0.65rem 1.25rem',
                        backgroundColor: '#f0fdf4',
                        borderBottom: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 700, color: '#166534' }}>
                        <Users size={16} />
                        <span>{otherBuyersForListing.length} Buyers Inquiring About "{activeConv.listingTitle}":</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {otherBuyersForListing.map((ob) => {
                          const isCurrent = ob.id === activeConv.id;
                          return (
                            <button
                              key={ob.id}
                              type="button"
                              onClick={() => loadActiveThread(ob.id)}
                              style={{
                                fontSize: '0.785rem',
                                fontWeight: isCurrent ? 700 : 500,
                                padding: '0.3rem 0.75rem',
                                borderRadius: '20px',
                                border: isCurrent ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                                backgroundColor: isCurrent ? '#16a34a' : '#ffffff',
                                color: isCurrent ? '#ffffff' : '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: isCurrent ? '0 1px 3px rgba(22,163,74,0.3)' : 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <User size={13} />
                              <span>{ob.otherPartyName}</span>
                              <span
                                style={{
                                  fontSize: '0.675rem',
                                  padding: '1px 5px',
                                  borderRadius: '10px',
                                  backgroundColor: isCurrent ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                                  color: isCurrent ? '#ffffff' : '#64748b',
                                }}
                              >
                                {(ob.replies?.length || 0) + 1} msgs
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Stream Area */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {/* Safe Meetup Banner in Chat */}
                    <div
                      style={{
                        padding: '0.65rem 1rem',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        color: '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        margin: '0 auto',
                        maxWidth: '90%',
                      }}
                    >
                      <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Campus Direct Messaging:</strong> Coordinate your meeting spot (e.g. Student Center, Campus Library) safely with your fellow student.
                      </span>
                    </div>

                    {/* Initial Inquiry Message Bubble */}
                    <div
                      style={{
                        alignSelf: activeConv.buyer ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.725rem',
                          color: '#64748b',
                          marginBottom: '0.2rem',
                          textAlign: activeConv.buyer ? 'right' : 'left',
                        }}
                      >
                        {activeConv.senderName} (Initial Inquiry) • {formatDate(activeConv.createdAt)}
                      </div>
                      <div
                        style={{
                          padding: '0.85rem 1.15rem',
                          borderRadius: activeConv.buyer ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          backgroundColor: activeConv.buyer ? '#09090b' : '#ffffff',
                          color: activeConv.buyer ? '#ffffff' : '#09090b',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          border: activeConv.buyer ? 'none' : '1px solid #e4e4e7',
                          fontSize: '0.925rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {activeConv.message}
                        {activeConv.contactInfo && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              paddingTop: '0.4rem',
                              borderTop: activeConv.buyer ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0',
                              fontSize: '0.775rem',
                              opacity: 0.9,
                            }}
                          >
                            Contact Shared: <strong>{activeConv.contactInfo}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Replies Stream */}
                    {activeConv.replies &&
                      activeConv.replies.map((reply) => {
                        const isMe = reply.fromMe;
                        return (
                          <div
                            key={reply.id}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.725rem',
                                color: '#64748b',
                                marginBottom: '0.2rem',
                                textAlign: isMe ? 'right' : 'left',
                              }}
                            >
                              {reply.senderName} • {formatDate(reply.createdAt)}
                            </div>
                            <div
                              style={{
                                padding: '0.85rem 1.15rem',
                                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                backgroundColor: isMe ? '#09090b' : '#ffffff',
                                color: isMe ? '#ffffff' : '#09090b',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                border: isMe ? 'none' : '1px solid #e4e4e7',
                                fontSize: '0.925rem',
                                lineHeight: 1.5,
                              }}
                            >
                              {reply.message}
                            </div>
                          </div>
                        );
                      })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Chips suggestions */}
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      borderTop: '1px solid #f1f5f9',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      gap: '0.5rem',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(chip)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Form */}
                  <form
                    onSubmit={handleSendReply}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type a direct message to ${activeConv.otherPartyName}...`}
                      className="form-input"
                      style={{
                        flex: 1,
                        fontSize: '0.925rem',
                        padding: '0.65rem 1rem',
                        borderRadius: '24px',
                        border: '1.5px solid #cbd5e1',
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="btn btn-primary"
                      style={{
                        borderRadius: '24px',
                        padding: '0.65rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: 600,
                      }}
                    >
                      {sending ? 'Sending...' : (
                        <>
                          <span>Send</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* No Conversation Selected Placeholder */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#94a3b8',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', color: '#475569', margin: 0 }}>
                    Select a conversation to start chatting
                  </h3>
                  <p style={{ fontSize: '0.875rem', maxWidth: '360px', marginTop: '0.4rem', color: '#64748b' }}>
                    Choose an item thread on the left to coordinate meetup times and discuss details directly with your peer.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
