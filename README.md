# NIIT Sales Negotiation Training System

## 🎯 Revolutionary AI-Powered Sales Training

A multi-agent LangGraph system that simulates real sales negotiations to train NIIT sales personnel. Two AI agents battle it out - one as NIIT salesperson, one as a tough customer - with post-negotiation analysis showing what worked, what didn't, and why.

### 🌟 Key Features

- **Multi-Agent System**: LangGraph orchestrates Sales Agent, Customer Agent, and Judge Agent
- **Real-Time Negotiation**: Watch AI agents negotiate live via WebSocket
- **PDF Learning**: Upload product brochures - AI learns and uses that knowledge
- **Configurable Personas**: Easy, Moderate, Tough, and Strategic customer types
- **Technique Analysis**: Identifies which sales techniques were used and their effectiveness
- **Learning Dashboard**: Post-negotiation analysis with specific coaching points
- **Unbiased Scoring**: Judge agent objectively rates performance from both sides

---

## 🏗️ Architecture

### Backend (Python + FastAPI + LangGraph)
```
backend/
├── main.py              # FastAPI server with LangGraph multi-agent system
└── requirements.txt     # Python dependencies
```

**Key Components:**
- **SalesAgent**: AI trained on NIIT materials, uses proven sales techniques
- **CustomerAgent**: Configurable persona (easy to strategic), pushes back realistically
- **JudgeAgent**: Analyzes negotiation, scores techniques, provides coaching
- **LangGraph Workflow**: Orchestrates agent turns, checks deal status, manages state

### Frontend (React)
```
frontend/src/
├── App.jsx                          # Main app orchestration
├── components/
│   ├── ConfigurationPanel.jsx      # Setup negotiation parameters
│   ├── NegotiationArena.jsx        # Live negotiation viewer
│   └── AnalysisDashboard.jsx       # Post-game analysis
└── [CSS files]
```

---

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Gemini API key

### Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set API key:**
```bash
export GEMINI_API_KEY='your-api-key-here'  # On Windows: set GEMINI_API_KEY=your-api-key-here
```

5. **Run server:**
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 📖 Usage Guide

### 1. Configure Training Scenario

**Upload Product Brochure (Optional but Recommended):**
- Click "Upload PDF Brochure"
- Select your NIIT product brochure
- AI will extract and learn product knowledge

**Sales Agent Configuration:**
- Product Name: What you're selling
- Target Price: Your ideal price point
- Minimum Price: Lowest you can go
- Product Details: Key value propositions

**Customer Agent Configuration:**
- Customer Persona:
  - **Easy**: Good for beginners, easily convinced
  - **Moderate**: Standard training level
  - **Tough**: Advanced challenge, very skeptical
  - **Strategic**: Expert level, uses advanced tactics
- Customer Budget: Their starting offer
- Requirements: Their key concerns and demands

**Simulation Settings:**
- Choose 5, 7, or 10 rounds

### 2. Watch Live Negotiation

- Real-time messages from both agents
- See techniques being used (value proposition, urgency, reciprocity, etc.)
- Track offers converging or diverging
- Status updates: round number, price gap, deal status

### 3. Review Analysis

**Overview Tab:**
- Complete performance analysis
- What worked vs what didn't
- Overall negotiation score

**Techniques Tab:**
- Which techniques were used
- How often each was employed
- Effectiveness ratings
- Definitions of each technique

**Learning Points Tab:**
- ✅ What worked well (top 3)
- 🎯 Areas for improvement (top 3)
- 💡 Specific coaching advice

**Transcript Tab:**
- Complete conversation history
- Techniques used per message
- Round-by-round breakdown

---

## 🎪 Demo Flow for Leadership Meeting

### Setup (2 minutes)
1. Open the app
2. Upload a real NIIT brochure
3. Configure a tough customer scenario
4. Show the interface - emphasize this is all live, not scripted

### Live Battle (7-10 minutes)
1. Hit "Start Negotiation Training"
2. Narrate as messages appear:
   - "Watch - the sales agent is using value-based selling..."
   - "Now the customer is pushing back on ROI..."
   - "Notice how the salesperson just made a strategic concession..."
3. Highlight technique tags appearing in real-time
4. Point out price gap closing (or not)

### Analysis Reveal (5 minutes)
1. Show the outcome (deal or no deal)
2. Go through each analysis tab:
   - **Techniques**: "Here's what worked"
   - **Learning Points**: "Here's what our sales team needs to improve"
3. Emphasize: "This is how we'll train every salesperson at scale"

### The Mic Drop (1 minute)
**"This isn't theory. This is how AI transforms sales training:**
- **Before**: One-size-fits-all training, no practice reps
- **After**: Personalized, unlimited practice against any customer type
- **ROI**: Every salesperson practices against thousands of scenarios before talking to real customers"

---

## 💡 Use Cases

### 1. Sales Team Training
- Practice against tough customers risk-free
- Learn which techniques work in different scenarios
- Get objective feedback without bruising egos

### 2. Onboarding New Sales Reps
- Accelerate learning curve
- Safe environment to make mistakes
- Build confidence before real calls

### 3. Product Launch Preparation
- Practice pitching new offerings
- Anticipate customer objections
- Refine messaging based on AI feedback

### 4. Competitive Win/Loss Analysis
- Simulate competitor matchups
- Identify winning strategies
- Find gaps in your value proposition

### 5. Sales Manager Coaching Tool
- Objective data on team performance
- Identify common weaknesses
- Create targeted training programs

---

## 🔧 Technical Details

### LangGraph Multi-Agent System

```python
# Workflow:
1. Initialize state with both agent positions
2. Sales agent makes first move
3. Customer agent responds
4. Check if deal reached (within 5% of prices)
5. Repeat until deal or max rounds
6. Judge agent analyzes entire negotiation
```

### Sales Techniques Identified

The system recognizes 7 key techniques:
- **Value Proposition**: ROI, benefits, outcomes
- **Social Proof**: Client success stories
- **Urgency**: Limited time offers
- **Reciprocity**: Strategic concessions
- **Anchoring**: Price expectations
- **Loss Aversion**: What they'll miss
- **Authority**: Expertise and credentials

### WebSocket Communication

```javascript
// Real-time updates:
- message: New negotiation message
- state_update: Current offers, deal status
- analysis: Final comprehensive analysis
- error: Any failures
```

---

## 🎯 Why This Will Blow Minds

### Traditional Demos Show:
- ❌ Pre-scripted conversations
- ❌ Single AI doing analysis
- ❌ No real-time adaptation
- ❌ Theoretical capabilities

### This System Shows:
- ✅ **Autonomous agents** negotiating independently
- ✅ **Real strategy** - not scripted responses
- ✅ **Live adaptation** - agents react to each other
- ✅ **Practical business value** - solves real problems
- ✅ **Measurable outcomes** - clear ROI path

### The "Steve Jobs Moment"

> "Watch two AI agents negotiate a $500,000 deal. 
> Neither knows what the other will say.
> At the end, a third AI tells us who won and why.
> **This is how we'll train 10,000 salespeople.**"

---

## 🚨 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.9+)
- Verify API key is set: `echo $ANTHROPIC_API_KEY`
- Install dependencies: `pip install -r requirements.txt`

### Frontend connection error
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify WebSocket connection in Network tab

### Negotiation hangs
- Check backend console for errors
- Verify API key has sufficient credits
- Try reducing max_rounds for testing

### PDF upload fails
- Ensure file is actual PDF
- Check file size (< 10MB recommended)
- Verify backend has write permissions

---

## 📈 Future Enhancements

### Phase 2 (Next Sprint)
- [ ] Voice synthesis - hear the negotiation
- [ ] Multi-language support
- [ ] Save negotiation replays
- [ ] Team leaderboards

### Phase 3 (Advanced)
- [ ] Custom technique library
- [ ] Industry-specific personas
- [ ] Integration with CRM data
- [ ] A/B test different strategies

### Phase 4 (Enterprise)
- [ ] Multi-user competitions
- [ ] Video avatars for agents
- [ ] Manager dashboards
- [ ] Certification programs

---

## 🎬 Deployment to Production

### Backend (Recommended: Fly.io or Railway)
```bash
# Using Railway
railway init
railway link
railway up
```

### Frontend (Recommended: Vercel or Netlify)
```bash
# Using Vercel
vercel --prod
```

### Environment Variables
```
ANTHROPIC_API_KEY=your-key-here
BACKEND_URL=https://your-backend.fly.dev
```

---

## 📞 Support

For questions or issues:
- Technical: Check backend logs
- API: Verify Anthropic API status
- Features: Review this README

---

## 🎯 Success Metrics

Track these KPIs:
- **Training Sessions**: # of negotiations run
- **Deal Rate**: % of successful closes
- **Technique Effectiveness**: Which techniques win most
- **Improvement Trends**: Sales scores over time
- **Time to Proficiency**: How fast new reps improve

---

**Built with:** FastAPI, LangGraph, React, Claude API, WebSockets

**License:** Internal NIIT use

**Version:** 1.0.0

**Last Updated:** February 2026
