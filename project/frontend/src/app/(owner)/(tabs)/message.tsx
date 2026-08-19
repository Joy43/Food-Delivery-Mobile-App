import React, { useState } from 'react';
import ConversationsList from '@/components/messaging/ConversationsList';
import ChatScreen from '@/components/messaging/ChatScreen';

export default function OwnerMessageScreen() {
  const [selectedConv, setSelectedConv] = useState<{
    id: string;
    title: string;
  } | null>(null);

  if (selectedConv) {
    return (
      <ChatScreen
        conversationId={selectedConv.id}
        title={selectedConv.title}
        onBack={() => setSelectedConv(null)}
      />
    );
  }

  return (
    <ConversationsList
      onSelectConversation={(id, title) => setSelectedConv({ id, title })}
    />
  );
}