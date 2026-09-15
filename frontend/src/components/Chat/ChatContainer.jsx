import React from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';

export default function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
  onPromptChipClick,
  onOpenArtifact
}) {
  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: 'var(--bg-dark)'
    }}>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onPromptChipClick={onPromptChipClick}
        onOpenArtifact={onOpenArtifact}
      />
      <InputArea
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </main>
  );
}
