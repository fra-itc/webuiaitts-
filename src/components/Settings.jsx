import React, { useState, useEffect } from 'react'

export default function Settings({ apiKey, apiUrl, onSave, ttsSettings, onSaveTTS }) {
  const [key, setKey] = useState(apiKey)
  const [url, setUrl] = useState(apiUrl)

  const [openaiKey, setOpenaiKey] = useState(ttsSettings.openaiKey || '')
  const [openaiUrl, setOpenaiUrl] = useState(ttsSettings.openaiUrl || 'https://api.openai.com/v1/audio/speech')

  const [engine, setEngine] = useState(ttsSettings.engine || 'browser')
  const [lang, setLang] = useState(ttsSettings.lang || 'en-US')
  const [voiceURI, setVoiceURI] = useState(ttsSettings.voiceURI || '')
  const [rate, setRate] = useState(ttsSettings.rate || 1)

  const [model, setModel] = useState(ttsSettings.model || 'tts-1')
  const [openaiVoice, setOpenaiVoice] = useState(ttsSettings.openaiVoice || 'alloy')

  const [voices, setVoices] = useState([])

  const [pitch, setPitch] = useState(ttsSettings.pitch ?? 1)
  const [volume, setVolume] = useState(ttsSettings.volume ?? 1)

  const [audioLang, setAudioLang] = useState(ttsSettings.audioLang || 'en-US')

  useEffect(() => {
    if (engine === 'browser' && window.speechSynthesis) {
      const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices()
        setVoices(vs)
        if (!voiceURI && vs.length > 0) {
          setVoiceURI(vs[0].voiceURI)
        }
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [engine])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(key, url)
    onSaveTTS({
      engine,
      lang,
      voiceURI,
      rate,
      model,
      openaiVoice,
      openaiKey,
      openaiUrl,
      pitch,
      volume,
      audioLang
    })
    alert('Impostazioni salvate con successo!')
  }

  const handleExport = async () => {
    const settings = {
      apiKey: key,
      apiUrl: url,
      ttsSettings: {
        engine,
        lang,
        voiceURI,
        rate,
        model,
        openaiVoice,
        openaiKey,
        openaiUrl,
        pitch,
        volume,
        audioLang
      }
    }
    const json = JSON.stringify(settings, null, 2)
    const blob = new Blob([json], { type: 'application/json' })

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'settings.json',
          types: [
            {
              description: 'JSON file',
              accept: { 'application/json': ['.json'] }
            }
          ]
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        alert('Esportazione completata!')
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('Errore durante l\'esportazione: ' + err.message)
        }
      }
    } else {
      alert('Il tuo browser non supporta la scelta del percorso di salvataggio. Verrà avviato un download automatico.')
      const urlBlob = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = urlBlob
      a.download = 'settings.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(urlBlob), 1000)
    }
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        setKey(imported.apiKey || '')
        setUrl(imported.apiUrl || '')

        const tts = imported.ttsSettings || {}
        setEngine(tts.engine || 'browser')
        setLang(tts.lang || 'en-US')
        setVoiceURI(tts.voiceURI || '')
        setRate(tts.rate || 1)
        setModel(tts.model || 'tts-1')
        setOpenaiVoice(tts.openaiVoice || 'alloy')
        setOpenaiKey(tts.openaiKey || '')
        setOpenaiUrl(tts.openaiUrl || 'https://api.openai.com/v1/audio/speech')
        setPitch(tts.pitch ?? 1)
        setVolume(tts.volume ?? 1)
        setAudioLang(tts.audioLang || 'en-US')

        onSave(imported.apiKey || '', imported.apiUrl || '')
        onSaveTTS({
          engine: tts.engine || 'browser',
          lang: tts.lang || 'en-US',
          voiceURI: tts.voiceURI || '',
          rate: tts.rate || 1,
          model: tts.model || 'tts-1',
          openaiVoice: tts.openaiVoice || 'alloy',
          openaiKey: tts.openaiKey || '',
          openaiUrl: tts.openaiUrl || 'https://api.openai.com/v1/audio/speech',
          pitch: tts.pitch ?? 1,
          volume: tts.volume ?? 1,
          audioLang: tts.audioLang || 'en-US'
        })
        alert('Importazione completata!')
      } catch (err) {
        alert('File di impostazioni non valido')
      }
    }
    reader.readAsText(file)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>API Key (Chat/OpenRouter):</label><br/>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
      </div>
      <div>
        <label>API URL (Chat/OpenRouter):</label><br/>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <hr />

      <h3>OpenAI TTS Credentials</h3>
      <div>
        <label>OpenAI API Key (TTS):</label><br/>
        <input
          type="text"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
        />
      </div>
      <div>
        <label>OpenAI API URL (TTS):</label><br/>
        <input
          type="text"
          value={openaiUrl}
          onChange={(e) => setOpenaiUrl(e.target.value)}
        />
      </div>

      <hr />

      <h3>TTS Settings</h3>

      <div>
        <label>Engine:</label><br/>
        <select value={engine} onChange={(e) => setEngine(e.target.value)}>
          <option value="browser">Browser TTS</option>
          <option value="openai">OpenAI TTS</option>
          <option value="none">None</option>
        </select>
      </div>

      <div>
        <label>Lingua audio (es. en-US, it-IT):</label><br/>
        <input
          type="text"
          value={audioLang}
          onChange={(e) => setAudioLang(e.target.value)}
        />
      </div>

      {engine === 'browser' && (
        <>
          <div>
            <label>Language:</label><br/>
            <input
              type="text"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            />
          </div>

          <div>
            <label>Voice:</label><br/>
            <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Velocità:</label><br/>
            <input
              type="number"
              min="0.1"
              max="3"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label>Timbro (Pitch):</label><br/>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label>Volume:</label><br/>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {engine === 'openai' && (
        <>
          <div>
            <label>Model:</label><br/>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="tts-1">tts-1</option>
              <option value="tts-1-hd">tts-1-hd</option>
            </select>
          </div>

          <div>
            <label>Voice:</label><br/>
            <select value={openaiVoice} onChange={(e) => setOpenaiVoice(e.target.value)}>
              <option value="alloy">alloy</option>
              <option value="echo">echo</option>
              <option value="fable">fable</option>
              <option value="onyx">onyx</option>
              <option value="nova">nova</option>
              <option value="shimmer">shimmer</option>
            </select>
          </div>

          <div>
            <label>Velocità:</label><br/>
            <input
              type="number"
              min="0.25"
              max="4"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label>Timbro (Pitch):</label><br/>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label>Volume:</label><br/>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      <button type="submit">Salva</button>

      <hr />

      <button type="button" onClick={handleExport}>Esporta impostazioni</button>
      <label style={{ marginLeft: '10px' }}>
        Importa impostazioni:
        <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'block', marginTop: '5px' }} />
      </label>
    </form>
  )
}
