import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/Chat/ChatContainer';
import ArtifactViewer from './components/Artifact/ArtifactViewer';
import { fetchModels, fetchSessions, createSession, fetchSession, deleteSession, streamChat } from './services/api';

export default function App() {
  const [modelsInfo, setModelsInfo] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Models and Initial Sessions on Mount
  useEffect(() => {
    loadModels();
    loadSessions();
  }, []);

  const loadModels = async () => {
    try {
      const data = await fetchModels();
      setModelsInfo(data);
      if (data.active_provider) {
        setSelectedProvider(data.active_provider);
      }
    } catch (e) {
      console.error('Error fetching models:', e);
    }
  };

  const loadSessions = async () => {
    try {
      const list = await fetchSessions();
      setSessions(list);
      if (list.length > 0) {
        selectSession(list[0].id);
      } else {
        handleNewSession();
      }
    } catch (e) {
      console.error('Error fetching sessions:', e);
    }
  };

  const selectSession = async (id) => {
    setCurrentSessionId(id);
    try {
      const session = await fetchSession(id);
      setMessages(session.messages || []);
      setArtifacts(session.artifacts || []);
      if (session.artifacts && session.artifacts.length > 0) {
        setActiveArtifact(session.artifacts[session.artifacts.length - 1]);
      } else {
        setActiveArtifact(null);
      }
    } catch (e) {
      console.error('Error loading session detail:', e);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSess = await createSession();
      setSessions(prev => [newSess, ...prev]);
      setCurrentSessionId(newSess.id);
      setMessages([]);
      setArtifacts([]);
      setActiveArtifact(null);
      setIsArtifactOpen(false);
    } catch (e) {
      console.error('Error creating new session:', e);
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      if (currentSessionId === id) {
        if (updated.length > 0) {
          selectSession(updated[0].id);
        } else {
          handleNewSession();
        }
      }
    } catch (e) {
      console.error('Error deleting session:', e);
    }
  };

  const handleSendMessage = async (text, skill = 'auto') => {
    let sessId = currentSessionId;
    if (!sessId) {
      const newSess = await createSession();
      setSessions(prev => [newSess, ...prev]);
      sessId = newSess.id;
      setCurrentSessionId(sessId);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      session_id: sessId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    const tempAsstMessage = {
      id: `asst-${Date.now()}`,
      session_id: sessId,
      role: 'assistant',
      content: '',
      citations: [],
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage, tempAsstMessage]);
    setIsLoading(true);

    let currentCitations = [];

    await streamChat({
      sessionId: sessId,
      message: text,
      provider: selectedProvider,
      skill: skill,
      onMeta: (meta) => {
        if (meta.citations) {
          currentCitations = meta.citations;
          setMessages(prev => prev.map(m => m.id === tempAsstMessage.id ? { ...m, citations: currentCitations } : m));
        }
      },
      onChunk: (chunk) => {
        setMessages(prev => prev.map(m => m.id === tempAsstMessage.id ? { ...m, content: m.content + chunk } : m));
      },
      onArtifact: (art) => {
        setArtifacts(prev => [...prev, art]);
        setActiveArtifact(art);
        setIsArtifactOpen(true);
      },
      onDone: () => {
        setIsLoading(false);
        loadSessions(); // Refresh session titles in sidebar
      },
      onError: (err) => {
        console.error('Streaming error:', err);
        setMessages(prev => prev.map(m => m.id === tempAsstMessage.id ? { ...m, content: m.content + `\n\n[Error streaming response: ${err.message}]` } : m));
        setIsLoading(false);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        modelsInfo={modelsInfo}
        onNewSession={handleNewSession}
        activeArtifact={activeArtifact}
        toggleArtifactViewer={() => setIsArtifactOpen(!isArtifactOpen)}
        onTriggerSkill={(sk) => handleSendMessage("Write a Ship 30 for 30 essay on B2B Growth Loops based on Elena Verna's transcript", sk)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={selectSession}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onPromptChipClick={(txt) => handleSendMessage(txt)}
          onOpenArtifact={() => setIsArtifactOpen(true)}
        />

        {isArtifactOpen && activeArtifact && (
          <ArtifactViewer
            artifact={activeArtifact}
            onClose={() => setIsArtifactOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
