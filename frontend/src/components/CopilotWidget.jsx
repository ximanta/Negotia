import React, { useMemo } from "react";
import Draggable from "react-draggable";

function CopilotWidget({
  visible,
  state,
  data,
  pinnedSuggestion,
  isHindi = false,
  onApplySuggestion,
  onExpand,
  onMinimize,
}) {
  const suggestions = useMemo(() => {
    const list = Array.isArray(data?.suggestions) ? data.suggestions : [];
    return list.filter(Boolean).slice(0, 3);
  }, [data]);

  if (!visible) return null;

  const showCard = state === "ready";
  const showThinking = state === "thinking";
  const heading = isHindi ? "कॉर्टेक्स कोपायलट" : "Cortex Copilot";
  const thinkingLabel = isHindi ? "विश्लेषण जारी..." : "Analyzing last student response...";
  const factLabel = isHindi ? "तथ्य जाँच" : "Fact Check";

  return (
    <Draggable bounds="body" handle=".copilotDragHandle">
      <div className={`copilotWidget ${showCard ? "expanded" : "collapsed"}`}>
        {showCard ? (
          <section className="copilotCard">
            <header className="copilotDragHandle">
              <strong>{heading}</strong>
              <button type="button" onClick={onMinimize} aria-label="Minimize copilot">
                -
              </button>
            </header>
            <p className="copilotAnalysis">{data?.analysis || thinkingLabel}</p>
            <div className="copilotSuggestionRow">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`copilotSuggestionChip ${pinnedSuggestion === item ? "pinned" : ""}`}
                  onClick={() => onApplySuggestion(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {data?.fact_check && (
              <div className="copilotFact">
                <span>{factLabel}</span>
                <p>{data.fact_check}</p>
              </div>
            )}
          </section>
        ) : (
          <button
            type="button"
            className={`copilotOrb ${showThinking ? "thinking" : ""}`}
            onClick={onExpand}
            aria-label="Open copilot"
          >
            <span>{showThinking ? "..." : "AI"}</span>
          </button>
        )}
      </div>
    </Draggable>
  );
}

export default CopilotWidget;
