import React from "react";
import "./typing-indicator.css";

export const TypingIndicator: React.FC = () => {
  return (
    <span className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
};

// Add this content to client/src/components/ui/typing-indicator.css
export default `
.typing-indicator {
  display: inline-flex;
}
.typing-indicator span {
  width: 8px;
  height: 8px;
  margin: 0 1px;
  background-color: #9CA3AF;
  border-radius: 50%;
  opacity: 0.6;
  animation: typing 1.4s infinite both;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typing {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
`;
