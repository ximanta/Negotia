// frontend/src/components/ConfigurationPanel.jsx
import React, { useState } from 'react';
import './ConfigurationPanel.css';

function ConfigurationPanel({ onStart, onUploadBrochure, brochureUploaded }) {
  const [config, setConfig] = useState({
    productName: 'Enterprise AI Training Program',
    targetPrice: 500000,
    minimumPrice: 350000,
    productDetails: 'Comprehensive AI/ML training with certification, 12-month support, custom modules',
    customerPersona: 'moderate',
    customerBudget: 350000,
    customerRequirements: 'ROI guarantee, flexible payment, scalability to 5000 employees',
    maxRounds: 7
  });

  const [fileSelected, setFileSelected] = useState(false);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      onUploadBrochure(file);
      setFileSelected(true);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(config);
  };

  return (
    <div className="config-panel">
      <div className="config-container">
        <div className="config-header">
          <h2>Configure Training Scenario</h2>
          <p>Set up your sales training simulation</p>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          {/* PDF Upload Section */}
          <div className="upload-section">
            <h3>📄 Product Brochure</h3>
            <div className="upload-box">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                id="pdfUpload"
                style={{ display: 'none' }}
              />
              <label htmlFor="pdfUpload" className="upload-button">
                {brochureUploaded ? '✓ Brochure Uploaded' : '📤 Upload PDF Brochure'}
              </label>
              <p className="upload-hint">
                Upload product brochure for AI to learn from
              </p>
            </div>
          </div>

          {/* Sales Configuration */}
          <div className="config-section">
            <h3>💼 Sales Agent Configuration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={config.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Price ($)</label>
                <input
                  type="number"
                  value={config.targetPrice}
                  onChange={(e) => handleChange('targetPrice', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Minimum Acceptable Price ($)</label>
                <input
                  type="number"
                  value={config.minimumPrice}
                  onChange={(e) => handleChange('minimumPrice', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Product Details & Value Proposition</label>
                <textarea
                  value={config.productDetails}
                  onChange={(e) => handleChange('productDetails', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Configuration */}
          <div className="config-section">
            <h3>👔 Customer Agent Configuration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Persona</label>
                <select
                  value={config.customerPersona}
                  onChange={(e) => handleChange('customerPersona', e.target.value)}
                >
                  <option value="easy">Easy - Eager buyer, easily convinced</option>
                  <option value="moderate">Moderate - Thoughtful, needs convincing</option>
                  <option value="tough">Tough - Hard negotiator, very skeptical</option>
                  <option value="strategic">Strategic - Sophisticated, uses advanced tactics</option>
                </select>
                <span className="persona-hint">
                  {config.customerPersona === 'easy' && '😊 Good for beginners'}
                  {config.customerPersona === 'moderate' && '🤔 Standard training'}
                  {config.customerPersona === 'tough' && '😤 Advanced challenge'}
                  {config.customerPersona === 'strategic' && '🧠 Expert level'}
                </span>
              </div>

              <div className="form-group">
                <label>Customer Budget ($)</label>
                <input
                  type="number"
                  value={config.customerBudget}
                  onChange={(e) => handleChange('customerBudget', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Customer Requirements & Concerns</label>
                <textarea
                  value={config.customerRequirements}
                  onChange={(e) => handleChange('customerRequirements', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="config-section">
            <h3>⚙️ Simulation Settings</h3>
            <div className="form-group">
              <label>Maximum Rounds</label>
              <select
                value={config.maxRounds}
                onChange={(e) => handleChange('maxRounds', parseInt(e.target.value))}
              >
                <option value={5}>5 Rounds - Quick Demo</option>
                <option value={7}>7 Rounds - Standard Training</option>
                <option value={10}>10 Rounds - Deep Negotiation</option>
              </select>
            </div>
          </div>

          <button type="submit" className="start-button">
            🚀 Start Negotiation Training
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfigurationPanel;
