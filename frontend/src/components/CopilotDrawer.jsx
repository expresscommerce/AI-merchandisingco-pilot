import { useState, useEffect, useRef } from 'react';
import { askCopilot } from '../api/copilot';

const STARTER_PROMPTS = [
  'Analyze my top 3 bestsellers',
  'Generate a bundle strategy for my store',
  'Why is my lowest performing product converting low?',
  'What pricing tweaks improve margin without losing sales?',
];

function renderFormattedText(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const formattedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const isBullet = /^(?:\d+\.|\-|\*)\s/.test(line.trim());

    return (
      <div key={lineIdx} className={isBullet ? 'copilot-line-bullet' : 'copilot-line-p'}>
        {formattedLine}
      </div>
    );
  });
}

export default function CopilotDrawer({ storeName, category, onAddProposal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [failedIndex, setFailedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Close on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend = inputValue) => {
    const text = (textToSend || '').trim();
    if (!text || isTyping) return;

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setFailedIndex(null);

    // Format history for backend (role & content)
    const historyPayload = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await askCopilot(text, historyPayload, storeName, category);
      const aiMessage = {
        role: 'assistant',
        content: response.reply || 'Analysis complete.',
        suggestedProposal: response.suggested_proposal || null,
        proposalAdded: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Copilot Send Error:', err);
      setFailedIndex(updatedMessages.length - 1);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = (msgIndex) => {
    const targetMsg = messages[msgIndex];
    if (targetMsg && targetMsg.role === 'user') {
      const trimmedHistory = messages.slice(0, msgIndex);
      setMessages(trimmedHistory);
      handleSendMessage(targetMsg.content);
    }
  };

  const handleChipClick = (promptText) => {
    handleSendMessage(promptText);
  };

  const handleAddProposal = (msgIndex, proposalObj) => {
    if (onAddProposal && proposalObj) {
      onAddProposal(proposalObj);
      setMessages((prev) =>
        prev.map((msg, i) => (i === msgIndex ? { ...msg, proposalAdded: true } : msg))
      );
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setFailedIndex(null);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        className="copilot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Merchandising Copilot"
        aria-label="Open AI Merchandising Copilot"
      >
        <span className="copilot-fab-sparkle">✨</span>
        <span className="copilot-fab-text">AI Copilot</span>
        {messages.length > 0 && <span className="copilot-fab-badge" />}
      </button>

      {/* Slide-over Drawer Overlay & Panel */}
      {isOpen && (
        <div className="copilot-drawer-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="copilot-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI Merchandising Copilot"
          >
            {/* Drawer Header */}
            <div className="copilot-header">
              <div className="copilot-header-title">
                <div className="copilot-icon-badge">✨</div>
                <div>
                  <h3>Merchandising Copilot</h3>
                  <span className="copilot-status">
                    <span className="status-dot-green" /> Live Store Grounded
                  </span>
                </div>
              </div>
              <div className="copilot-header-actions">
                {messages.length > 0 && (
                  <button
                    className="copilot-icon-btn"
                    onClick={handleClearHistory}
                    title="Clear Conversation"
                  >
                    🗑️
                  </button>
                )}
                <button
                  className="copilot-icon-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close Drawer (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="copilot-body">
              {messages.length === 0 && (
                <div className="copilot-empty-state">
                  <div className="copilot-empty-sparkle">✨</div>
                  <h4>How can I help optimize your store today?</h4>
                  <p>
                    I have full context on your products, active proposals, and category benchmarks. Select a prompt or type below:
                  </p>
                  <div className="copilot-chips-grid">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        className="copilot-chip"
                        onClick={() => handleChipClick(prompt)}
                      >
                        <span className="chip-sparkle">💡</span> {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isFailed = failedIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`copilot-bubble-wrapper ${isUser ? 'user-wrapper' : 'ai-wrapper'}`}
                  >
                    {!isUser && <div className="copilot-avatar">✨</div>}

                    <div className={`copilot-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                      <div className="copilot-message-text">
                        {renderFormattedText(msg.content)}
                      </div>

                      {/* Inline Suggested Proposal Card */}
                      {!isUser && msg.suggestedProposal && (
                        <div className="copilot-inline-proposal">
                          <div className="inline-proposal-header">
                            <span className="inline-tag">⚡ Generated Proposal</span>
                            <span className="inline-impact">{msg.suggestedProposal.estimated_impact}</span>
                          </div>
                          <div className="inline-proposal-title">
                            {msg.suggestedProposal.product_name}
                          </div>
                          <div className="inline-proposal-reason">
                            {msg.suggestedProposal.reasoning}
                          </div>
                          <button
                            className={`inline-add-proposal-btn ${msg.proposalAdded ? 'added' : ''}`}
                            disabled={msg.proposalAdded}
                            onClick={() => handleAddProposal(idx, msg.suggestedProposal)}
                          >
                            {msg.proposalAdded ? '✓ Added to Proposals' : '+ Add as Proposal'}
                          </button>
                        </div>
                      )}

                      {/* Retry Button on failure */}
                      {isUser && isFailed && (
                        <div className="copilot-retry-box">
                          <span className="error-text">⚠️ Delivery failed</span>
                          <button className="copilot-retry-btn" onClick={() => handleRetry(idx)}>
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="copilot-bubble-wrapper ai-wrapper">
                  <div className="copilot-avatar">✨</div>
                  <div className="copilot-bubble ai-bubble copilot-typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Footer */}
            <div className="copilot-footer">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="copilot-input-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="copilot-input"
                  placeholder="Ask Merchandising Copilot..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className="copilot-send-btn"
                  disabled={!inputValue.trim() || isTyping}
                  title="Send message"
                >
                  ➔
                </button>
              </form>
              <div className="copilot-footer-note">
                Grounded in active store catalog &amp; DeepInfra LLM context
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
