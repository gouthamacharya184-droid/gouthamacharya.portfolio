import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, ChevronLeft, Search, Plus, X, Hash, Star, Clock, Trash2, Download, Settings
} from 'lucide-react';

function getSessionPreview(session) {
  const msgs = session.messages.filter(m => m.role === 'user');
  if (msgs.length === 0) return 'Start chatting…';
  const last = msgs[msgs.length - 1].content;
  return last.length > 60 ? last.slice(0, 57) + '…' : last;
}

function formatRelativeDate(ts) {
  const now = Date.now();
  const diff = now - ts;
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatSidebar({
  sessions, activeSessionId, sidebarOpen,
  onNewChat, onSelectSession, onDeleteSession,
  onPinSession, onToggleSidebar, onSettings, onExport
}) {
  const [search, setSearch] = useState('');
  const [hoverId, setHoverId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.filter(s =>
      !q || s.title.toLowerCase().includes(q) || getSessionPreview(s).toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const label = formatRelativeDate(s.updatedAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(s);
    });
    return groups;
  }, [filtered]);

  const pinned = filtered.filter(s => s.pinned);

  return (
    <motion.div
      animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex-shrink-0 overflow-hidden flex flex-col h-full bg-[#03050a] border-r border-white/5"
    >
      {sidebarOpen && (
        <div className="flex flex-col h-full w-[280px] flex-shrink-0 select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center">
                <Bot size={14} className="text-cyan-400" />
              </div>
              <span className="text-[13px] font-bold text-white tracking-tight uppercase">Portfolio AI</span>
            </div>
            <button
              onClick={onToggleSidebar}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={15} />
            </button>
          </div>

          {/* New Chat */}
          <div className="px-3 pb-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 group border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
            >
              <Plus size={15} className="text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
              New Chat
              <span className="ml-auto text-[10px] text-slate-600 font-mono bg-white/5 px-1.5 py-0.5 rounded">⌘N</span>
            </motion.button>
          </div>

          {/* Search */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Search size={13} className="text-slate-600 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats…"
                className="flex-1 bg-transparent text-[12px] text-white placeholder:text-slate-600 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Sessions Scroll List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-4">
            {pinned.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold px-2 mb-1.5 flex items-center gap-1.5">
                  <Star size={9} /> Pinned
                </p>
                {pinned.map(s => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isActive={s.id === activeSessionId}
                    isHovered={hoverId === s.id}
                    onSelect={() => onSelectSession(s.id)}
                    onDelete={() => onDeleteSession(s.id)}
                    onPin={() => onPinSession(s.id)}
                    onHover={setHoverId}
                  />
                ))}
              </div>
            )}

            {Object.entries(grouped).map(([label, items]) => {
              const unpinned = items.filter(s => !s.pinned);
              if (!unpinned.length) return null;
              return (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold px-2 mb-1.5 flex items-center gap-1.5">
                    <Clock size={9} /> {label}
                  </p>
                  {unpinned.map(s => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === activeSessionId}
                      isHovered={hoverId === s.id}
                      onSelect={() => onSelectSession(s.id)}
                      onDelete={() => onDeleteSession(s.id)}
                      onPin={() => onPinSession(s.id)}
                      onHover={setHoverId}
                    />
                  ))}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <Hash size={20} className="text-slate-700 mx-auto mb-2" />
                <p className="text-[12px] text-slate-600">No chats found</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-white/[0.04] space-y-1 bg-[#010204]">
            <button
              onClick={onExport}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Download size={13} />
              Export Chat History
            </button>
            {onSettings && (
              <button
                onClick={onSettings}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings size={13} />
                Settings Config
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SessionItem({ session, isActive, isHovered, onSelect, onDelete, onPin, onHover }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onHoverStart={() => onHover(session.id)}
      onHoverEnd={() => onHover(null)}
      className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer mb-0.5 transition-all duration-200 ${
        isActive
          ? 'bg-white/[0.08] border border-white/[0.1]'
          : 'hover:bg-white/[0.04] border border-transparent'
      }`}
      onClick={onSelect}
    >
      <Hash size={13} className={`mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
          {session.title}
        </p>
        <p className="text-[10px] text-slate-600 truncate mt-0.5">{getSessionPreview(session)}</p>
      </div>

      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-0.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onPin}
              className={`h-5 w-5 rounded flex items-center justify-center transition-all ${session.pinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}
              title={session.pinned ? 'Unpin' : 'Pin'}
            >
              <Star size={10} fill={session.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onDelete}
              className="h-5 w-5 rounded flex items-center justify-center text-slate-600 hover:text-rose-400 transition-all"
              title="Delete chat"
            >
              <Trash2 size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
