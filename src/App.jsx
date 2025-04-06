import React, { useState } from 'react'
import Chat from './components/Chat'
import Settings from './components/Settings'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '')
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'https://openrouter.ai/api/v1/chat/completions')
  const [showSettings, setShowSettings] = useState(!apiKey)

  const [ttsSettings, setTtsSettings] = useState(() => {
    const saved = localStorage.getItem('ttsSettings')
    return saved
      ? JSON.parse(saved)
      : {
          engine: 'browser',
          lang: 'en-US',
          voiceURI: '',
          rate: 1,
          model: 'tts-1',
          openaiVoice: 'alloy',
          openaiKey: '',
          openaiUrl: 'https://api.openai.com/v1/audio/speech'
        }
  })

  const saveSettings = (key, url) => {
    setApiKey(key)
    setApiUrl(url)
    localStorage.setItem('apiKey', key)
    localStorage.setItem('apiUrl', url)
    setShowSettings(false)
  }

  const saveTTSSettings = (settings) => {
    setTtsSettings(settings)
    localStorage.setItem('ttsSettings', JSON.stringify(settings))
  }

  return (
    <div className="container">
      <h1>AI Chat with TTS</h1>
      <button onClick={() => setShowSettings(!showSettings)}>
        {showSettings ? 'Close Settings' : 'Settings'}
      </button>
      {showSettings ? (
        <Settings
          apiKey={apiKey}
          apiUrl={apiUrl}
          onSave={saveSettings}
          ttsSettings={ttsSettings}
          onSaveTTS={saveTTSSettings}
        />
      ) : (
        <Chat apiKey={apiKey} apiUrl={apiUrl} ttsSettings={ttsSettings} />
      )}
    </div>
  )
}
