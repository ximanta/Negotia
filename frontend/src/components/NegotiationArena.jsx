// frontend/src/components/NegotiationArena.jsx
import React, { useEffect, useRef } from 'react';
import './NegotiationArena.css';

function NegotiationArena({ messages, stateUpdate, config }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSalesGap = () => {
    if (!stateUpdate) return null;
    const gap = Math.abs(stateUpdate.sales_offer - stateUpdate.customer_offer);
    const avgPrice = (stateUpdate.sales_offer + stateUpdate.customer_offer) / 2;
    const gapPercent = ((gap / avgPrice) * 100).toFixed(1);
    return { gap, gapPercent };
  };

  const gapData = getSalesGap();

  return (
    <div className="negotiation-arena">
      {/* Live Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Round</span>
          <span className="status-value">{stateUpdate?.round || 1} / {config?.maxRounds || 7}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Status</span>
          <span className={`status-badge ${stateUpdate?.deal_status}`}>
            {stateUpdate?.deal_status === 'ongoing' ? '🔄 Live' : 
             stateUpdate?.deal_status === 'closed' ? '✅ Deal' : '❌ Failed'}
          </span>
        </div>
        {gapData && (
          <div className="status-item">
            <span className="status-label">Price Gap</span>
            <span className="status-value">${gapData.gap.toLocaleString()} ({gapData.gapPercent}%)</span>
          </div>
        )}
      </div>

      {/* Agent Panels */}
      <div className="agents-container">
        <div className="agent-panel sales">
          <div className="agent-header">
            <h3>🎯 NIIT Sales Agent</h3>
            <span className="agent-role">Seller</span>
          </div>
          <div className="agent-stats">
            <div className="stat">
              <span className="stat-label">Current Offer</span>
              <span className="stat-value sales-color">
                ${stateUpdate?.sales_offer?.toLocaleString() || config?.targetPrice.toLocaleString()}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Target</span>
              <span className="stat-value">${config?.targetPrice.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Floor</span>
              <span className="stat-value">${config?.minimumPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="agent-product">
            <strong>{config?.productName}</strong>
          </div>
        </div>

        <div className="vs-divider">
          <span className="vs-text">VS</span>
        </div>

        <div className="agent-panel customer">
          <div className="agent-header">
            <h3>🏢 Customer Agent</h3>
            <span className="agent-role">Buyer</span>
          </div>
          <div className="agent-stats">
            <div className="stat">
              <span className="stat-label">Current Offer</span>
              <span className="stat-value customer-color">
                ${stateUpdate?.customer_offer?.toLocaleString() || config?.customerBudget.toLocaleString()}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Budget</span>
              <span className="stat-value">${config?.customerBudget.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Persona</span>
              <span className="stat-value persona-badge">{config?.customerPersona}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="transcript-container">
        <div className="transcript-header">
          <h3>📝 Live Negotiation Transcript</h3>
          <div className="pulse-indicator">
            <span className="pulse-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Negotiation starting...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.agent}`}>
                <div className="message-header">
                  <div className="message-meta">
                    <span className="message-agent">
                      {msg.agent === 'sales' ? '🎯 NIIT Sales' : '🏢 Customer'}
                    </span>
                    <span className="message-round">Round {msg.round}</span>
                  </div>
                  {msg.techniques && msg.techniques.length > 0 && (
                    <div className="techniques-tags">
                      {msg.techniques.map((tech, i) => (
                        <span key={i} className="technique-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${((stateUpdate?.round || 1) / (config?.maxRounds || 7)) * 100}%` 
            }}
          />
        </div>
        <p className="progress-text">
          {stateUpdate?.deal_status === 'ongoing' 
            ? 'Negotiation in progress...' 
            : 'Generating analysis...'}
        </p>
      </div>
    </div>
  );
}

export default NegotiationArena;
