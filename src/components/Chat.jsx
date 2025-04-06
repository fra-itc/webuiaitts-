import React, { useState, useRef, useEffect } from 'react'

export default function Chat({ apiKey, apiUrl, ttsSettings }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatBoxRef = useRef(null)

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error('API error')
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message.content.trim()

      setMessages([...newMessages, { role: 'assistant', content: aiMessage }])
      speak(aiMessage)
    } catch (err) {
      console.error(err)
      setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + err.message }])
    }
  }

  const speak = async (text) => {
    if (ttsSettings.engine === 'openai' && ttsSettings.openaiKey) {
      try {
        const response = await fetch(ttsSettings.openaiUrl || 'https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ttsSettings.openaiKey}`
          },
          body: JSON.stringify({
            model: ttsSettings.model || 'tts-1',
            input: text,
            voice: ttsSettings.openaiVoice || 'alloy',
            speed: ttsSettings.rate || 1
          })
        })

        if (!response.ok) throw new Error('OpenAI TTS API error')

        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
        return
      } catch (err) {
        console.error('OpenAI TTS failed, falling back to browser TTS', err)
      }
    }

    // fallback browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = ttsSettings.lang || 'en-US'
      utterance.rate = ttsSettings.rate || 1

      if (ttsSettings.voiceURI) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === ttsSettings.voiceURI)
        if (voice) utterance.voice = voice
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={'message ' + msg.role}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
