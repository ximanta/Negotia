# System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NIIT NEGOTIATION TRAINER                     │
│                     Real-Time Multi-Agent Training System            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │  Configuration  │  │  Negotiation     │  │    Analysis     │   │
│  │     Panel       │─▶│     Arena        │─▶│   Dashboard     │   │
│  │                 │  │                  │  │                 │   │
│  │ • Upload PDF    │  │ • Live Messages  │  │ • Techniques    │   │
│  │ • Set Personas  │  │ • Price Tracking │  │ • Learning Pts  │   │
│  │ • Config Params │  │ • Technique Tags │  │ • Scoring       │   │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘   │
│           │                     ▲                      ▲            │
│           │                     │                      │            │
│           └─────────────────────┴──────────────────────┘            │
│                          WebSocket (Real-Time)                      │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    │ ws://localhost:8000/negotiate
                                    │
┌───────────────────────────────────┴─────────────────────────────────┐
│                      BACKEND (Python + FastAPI)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                   LangGraph Workflow                        │     │
│  │                                                              │     │
│  │    ┌──────────┐      ┌──────────┐      ┌──────────┐       │     │
│  │    │  Sales   │◄────▶│ Customer │◄────▶│  Judge   │       │     │
│  │    │  Agent   │      │  Agent   │      │  Agent   │       │     │
│  │    └──────────┘      └──────────┘      └──────────┘       │     │
│  │         │                  │                  │             │     │
│  │         │                  │                  │             │     │
│  │         └──────────────────┴──────────────────┘             │     │
│  │                            │                                │     │
│  │                    ┌───────▼────────┐                      │     │
│  │                    │  Shared State  │                      │     │
│  │                    │   (TypedDict)  │                      │     │
│  │                    │                │                      │     │
│  │                    │ • Messages     │                      │     │
│  │                    │ • Positions    │                      │     │
│  │                    │ • Techniques   │                      │     │
│  │                    │ • Deal Status  │                      │     │
│  │                    └────────────────┘                      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Supporting Systems                       │     │
│  │                                                              │     │
│  │  ┌───────────────┐  ┌──────────────┐  ┌───────────────┐  │     │
│  │  │ PDF Processor │  │   WebSocket  │  │  Technique    │  │     │
│  │  │               │  │   Manager    │  │  Analyzer     │  │     │
│  │  │ Extract text  │  │              │  │               │  │     │
│  │  │ from brochures│  │ Real-time    │  │ Pattern       │  │     │
│  │  │               │  │ streaming    │  │ matching      │  │     │
│  │  └───────────────┘  └──────────────┘  └───────────────┘  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    │ HTTP REST API
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                      ANTHROPIC CLAUDE API                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • Model: claude-sonnet-4-20250514                                   │
│  • Streaming: Real-time token generation                             │
│  • Context: Full conversation history                                │
│  • Temperature: Controlled for consistency                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                            DATA FLOW

1. USER CONFIGURES
   └─▶ Frontend sends config via WebSocket

2. NEGOTIATION STARTS
   └─▶ LangGraph initializes state
       └─▶ Sales Agent analyzes, calls Claude API
           └─▶ Message streamed to frontend
               └─▶ Customer Agent responds, calls Claude API
                   └─▶ Message streamed to frontend
                       └─▶ Check if deal reached
                           ├─▶ YES: Jump to Analysis
                           └─▶ NO: Next round

3. ANALYSIS PHASE
   └─▶ Judge Agent gets full transcript
       └─▶ Calls Claude API for comprehensive analysis
           └─▶ Structured analysis sent to frontend
               └─▶ User reviews learning points

═══════════════════════════════════════════════════════════════════════

                        AGENT CAPABILITIES

┌─────────────────────────────────────────────────────────────────────┐
│                          SALES AGENT                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Knowledge:                                                           │
│ • Product brochure (PDF uploaded)                                   │
│ • Target/minimum prices                                             │
│ • NIIT value propositions                                           │
│                                                                      │
│ Techniques:                                                          │
│ • Value-based selling         • Social proof                        │
│ • Anchoring                   • Reciprocity                         │
│ • Urgency creation            • Loss aversion                       │
│ • Authority positioning                                             │
│                                                                      │
│ Strategy:                                                            │
│ • Opens strong at target price                                      │
│ • Makes calculated concessions                                      │
│ • Emphasizes ROI and outcomes                                       │
│ • Adapts to customer responses                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER AGENT                                │
├─────────────────────────────────────────────────────────────────────┤
│ Personas:                                                            │
│ • EASY: Eager buyer, flexible budget                                │
│ • MODERATE: Thoughtful, needs convincing                            │
│ • TOUGH: Aggressive negotiator, very skeptical                      │
│ • STRATEGIC: Sophisticated, advanced tactics                        │
│                                                                      │
│ Behaviors:                                                           │
│ • Challenges pricing                                                │
│ • Demands proof of value                                            │
│ • References competitors                                            │
│ • Makes strategic counter-offers                                    │
│ • Tests sales agent knowledge                                       │
│                                                                      │
│ Constraints:                                                         │
│ • Budget limit (can stretch 20%)                                    │
│ • Specific requirements                                             │
│ • Willing to walk away                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          JUDGE AGENT                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Analysis Areas:                                                      │
│ • Outcome assessment (deal/no-deal)                                 │
│ • Technique effectiveness scoring                                   │
│ • Key moment identification                                         │
│ • Learning point extraction                                         │
│ • Objective performance rating                                      │
│                                                                      │
│ Output:                                                              │
│ • Comprehensive written analysis                                    │
│ • Top 3 successes                                                   │
│ • Top 3 improvements needed                                         │
│ • Specific coaching advice                                          │
│ • Overall negotiation score (1-100)                                 │
│                                                                      │
│ Key Feature:                                                         │
│ • UNBIASED - judges both sides objectively                          │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
