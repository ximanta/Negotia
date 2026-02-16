// frontend/src/components/AnalysisDashboard.jsx
import React, { useState } from 'react';
import './AnalysisDashboard.css';

function AnalysisDashboard({ analysis, messages, config, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');

  const getDealOutcome = () => {
    if (analysis.deal_status === 'closed') {
      const finalPrice = Math.round((analysis.final_prices.sales_offer + analysis.final_prices.customer_offer) / 2);
      return {
        status: 'Deal Reached',
        icon: '🤝',
        color: 'success',
        price: finalPrice,
        message: `Successfully closed at $${finalPrice.toLocaleString()}`
      };
    } else {
      return {
        status: 'No Deal',
        icon: '❌',
        color: 'failure',
        gap: Math.abs(analysis.final_prices.sales_offer - analysis.final_prices.customer_offer),
        message: 'Negotiation ended without agreement'
      };
    }
  };

  const outcome = getDealOutcome();

  const getTechniqueStats = () => {
    const techniques = {};
    messages.forEach(msg => {
      if (msg.techniques) {
        msg.techniques.forEach(tech => {
          techniques[tech] = (techniques[tech] || 0) + 1;
        });
      }
    });
    return Object.entries(techniques).sort((a, b) => b[1] - a[1]);
  };

  const techniqueStats = getTechniqueStats();

  const parseAnalysisSection = (sectionName) => {
    const text = analysis.full_analysis;
    const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n[A-Z]|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0] : '';
  };

  return (
    <div className="analysis-dashboard">
      {/* Outcome Banner */}
      <div className={`outcome-banner ${outcome.color}`}>
        <div className="outcome-icon">{outcome.icon}</div>
        <div className="outcome-content">
          <h2>{outcome.status}</h2>
          <p className="outcome-message">{outcome.message}</p>
          {outcome.price && (
            <div className="deal-details">
              <div className="deal-stat">
                <span>Final Price</span>
                <strong>${outcome.price.toLocaleString()}</strong>
              </div>
              <div className="deal-stat">
                <span>From Target</span>
                <strong>{(((outcome.price - config.targetPrice) / config.targetPrice) * 100).toFixed(1)}%</strong>
              </div>
              <div className="deal-stat">
                <span>Rounds Used</span>
                <strong>{messages.length / 2} / {config.maxRounds}</strong>
              </div>
            </div>
          )}
          {outcome.gap && (
            <div className="deal-details">
              <div className="deal-stat">
                <span>Final Gap</span>
                <strong>${outcome.gap.toLocaleString()}</strong>
              </div>
              <div className="deal-stat">
                <span>Sales Final</span>
                <strong>${analysis.final_prices.sales_offer.toLocaleString()}</strong>
              </div>
              <div className="deal-stat">
                <span>Customer Final</span>
                <strong>${analysis.final_prices.customer_offer.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="analysis-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'techniques' ? 'active' : ''}
          onClick={() => setActiveTab('techniques')}
        >
          🎯 Techniques
        </button>
        <button 
          className={activeTab === 'learning' ? 'active' : ''}
          onClick={() => setActiveTab('learning')}
        >
          📚 Learning Points
        </button>
        <button 
          className={activeTab === 'transcript' ? 'active' : ''}
          onClick={() => setActiveTab('transcript')}
        >
          📝 Full Transcript
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="analysis-section">
              <h3>🎯 Performance Analysis</h3>
              <div className="analysis-text">
                {analysis.full_analysis}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="techniques-content">
            <h3>🎯 Sales Techniques Used</h3>
            <div className="techniques-grid">
              {techniqueStats.map(([technique, count]) => (
                <div key={technique} className="technique-card">
                  <div className="technique-name">{technique.replace(/_/g, ' ')}</div>
                  <div className="technique-count">Used {count} {count === 1 ? 'time' : 'times'}</div>
                  <div className="technique-bar">
                    <div 
                      className="technique-fill"
                      style={{ width: `${(count / Math.max(...techniqueStats.map(t => t[1]))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="technique-legend">
              <h4>Technique Definitions:</h4>
              <ul>
                <li><strong>Value Proposition:</strong> Emphasizing ROI, benefits, and outcomes</li>
                <li><strong>Social Proof:</strong> Referencing other clients and success stories</li>
                <li><strong>Urgency:</strong> Creating time pressure or limited availability</li>
                <li><strong>Reciprocity:</strong> Making concessions to get something in return</li>
                <li><strong>Anchoring:</strong> Setting price expectations with high initial offers</li>
                <li><strong>Loss Aversion:</strong> Highlighting what customer might miss out on</li>
                <li><strong>Authority:</strong> Leveraging expertise and credentials</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="learning-content">
            <div className="learning-section success">
              <h3>✅ What Worked Well</h3>
              <div className="learning-points">
                {parseAnalysisSection('things.*did well')}
              </div>
            </div>

            <div className="learning-section improvement">
              <h3>🎯 Areas for Improvement</h3>
              <div className="learning-points">
                {parseAnalysisSection('areas for improvement')}
              </div>
            </div>

            <div className="learning-section coaching">
              <h3>💡 Coaching Advice</h3>
              <div className="learning-points">
                {parseAnalysisSection('coaching advice')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="transcript-content">
            <h3>📝 Complete Negotiation Transcript</h3>
            <div className="transcript-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`transcript-message ${msg.agent}`}>
                  <div className="transcript-header">
                    <strong>{msg.agent === 'sales' ? '🎯 NIIT Sales' : '🏢 Customer'}</strong>
                    <span>Round {msg.round}</span>
                  </div>
                  <div className="transcript-text">{msg.content}</div>
                  {msg.techniques && msg.techniques.length > 0 && (
                    <div className="transcript-techniques">
                      Techniques: {msg.techniques.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
        <button className="btn-primary" onClick={onReset}>
          🔄 New Training Session
        </button>
      </div>
    </div>
  );
}

export default AnalysisDashboard;
