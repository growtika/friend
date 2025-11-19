
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const MATE_COLORS = {
  backgroundDark: '#0E0F11',
  backgroundLight: '#F2EEE0',
  textDark: '#F2EEE0',
  textLight: '#0E0F11',
  accentGreen: '#4ED1A1',
  accentRed: '#FF567B',
  accentBlue: '#6DB4FF',
  grey: '#666',
  darkGrey: '#333',
  lightGrey: '#aaa'
};

function App() {
  // Default to Light Mode as requested
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [activeModel, setActiveModel] = useState('gemini3');
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  
  // Theme constants
  const bg = themeMode === 'dark' ? MATE_COLORS.backgroundDark : MATE_COLORS.backgroundLight;
  const text = themeMode === 'dark' ? MATE_COLORS.textDark : MATE_COLORS.textLight;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load Game
  useEffect(() => {
    const load = async () => {
      const url = activeModel === 'gemini3' ? './init/gemini3.html' : './init/gemini2p5.html';
      try {
        const res = await fetch(url);
        const html = await res.text();
        setGameHtml(html);
      } catch(e) {
        console.error("Failed to load game");
      }
    };
    load();
  }, [activeModel]);

  // Toggle Theme
  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    if(iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'SET_THEME', payload: newMode }, '*');
    }
  };

  // Handle Game Start/Pause
  useEffect(() => {
    if(iframeRef.current && iframeRef.current.contentWindow) {
        // Small delay to ensure iframe logic is ready
        setTimeout(() => {
             iframeRef.current?.contentWindow?.postMessage({ type: 'PAUSE_GAME', payload: showDisclaimer }, '*');
             // Force theme sync on start
             iframeRef.current?.contentWindow?.postMessage({ type: 'SET_THEME', payload: themeMode }, '*');
        }, 100);
    }
  }, [showDisclaimer, gameHtml, themeMode]);

  const styles = {
    container: {
      position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%',
      background: bg, color: text, fontFamily: "'Inter', sans-serif", transition: 'background 0.3s'
    },
    header: {
      position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '80px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
      zIndex: 10
    },
    logoGroup: {
        display: 'flex', alignItems: 'center', gap: '12px'
    },
    logo: {
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '36px', letterSpacing: '-1px'
    },
    tagline: {
      fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '2px', fontWeight: 600, opacity: 0.6
    },
    btn: {
      background: 'transparent', border: `1px solid ${text}`, color: text,
      padding: '10px 24px', borderRadius: '30px', cursor: 'pointer',
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' as const
    },
    modal: {
      position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%',
      background: themeMode === 'light' ? 'rgba(242, 238, 224, 0.98)' : 'rgba(14, 15, 17, 0.98)',
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
      zIndex: 20
    },
    modalContent: {
        maxWidth: '600px', width: '100%', textAlign: 'center' as const
    },
    heroTitle: {
        fontFamily: "'Space Grotesk', sans-serif", fontSize: '64px', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-2px', marginBottom: '32px'
    },
    instructionGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px', textAlign: 'left' as const
    },
    instructionItem: {
        borderTop: `1px solid ${text}`, paddingTop: '16px'
    },
    ctaButton: {
        background: text, color: bg, border: 'none', padding: '20px 60px', borderRadius: '50px',
        fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' as const,
        transition: 'transform 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoGroup}>
             <div style={styles.logo}>MATE</div>
        </div>
        
        <div style={styles.tagline}>Wisdom-led Performance</div>
        
        <button style={styles.btn} onClick={toggleTheme}>
            {themeMode === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* Game Iframe */}
      {gameHtml && (
        <iframe 
            ref={iframeRef}
            srcDoc={gameHtml}
            style={{width: '100%', height: '100%', border: 'none', display: 'block'}}
            title="Mate Game"
        />
      )}

      {/* Overlay Modal */}
      {showDisclaimer && (
        <div style={styles.modal}>
           <div style={styles.modalContent}>
               <div style={styles.heroTitle}>PUT WISDOM<br/>TO WORK</div>
               
               <div style={styles.instructionGrid}>
                   <div style={styles.instructionItem}>
                       <div style={{fontSize: '11px', fontWeight: 700, marginBottom: '8px', opacity: 0.5, letterSpacing: '1px'}}>DEFEND</div>
                       <div style={{fontSize: '14px', lineHeight: 1.4}}>Destroy <strong>Threats</strong> (Red) to build Impact and unlock the Arsenal.</div>
                   </div>
                   <div style={styles.instructionItem}>
                       <div style={{fontSize: '11px', fontWeight: 700, marginBottom: '8px', opacity: 0.5, letterSpacing: '1px'}}>FOCUS</div>
                       <div style={{fontSize: '14px', lineHeight: 1.4}}>Avoid <strong>Noise</strong> (Grey). Noise drains your resilience.</div>
                   </div>
                   <div style={styles.instructionItem}>
                       <div style={{fontSize: '11px', fontWeight: 700, marginBottom: '8px', opacity: 0.5, letterSpacing: '1px'}}>AUTOMATE</div>
                       <div style={{fontSize: '14px', lineHeight: 1.4}}>Collect <strong>Wisdom</strong> (Green) to deploy the AI Agent.</div>
                   </div>
               </div>

               <button 
                style={styles.ctaButton} 
                onClick={() => setShowDisclaimer(false)}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
               >
                   Start
               </button>
           </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root') || document.body);
root.render(<App />);
