// src/pages/LandingPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15); // Default fallback demo duration

  // Handle CTA routing: login if unauthenticated, dashboard if token exists
  const handleStartCreating = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 15);
    }
  };

  const handleTimelineScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24); // 24 fps timecode
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          CineFlow<span style={{ color: '#6366f1' }}>AI</span>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => navigate('/login')} style={styles.secondaryBtn}>
            Sign In
          </button>
          <button onClick={handleStartCreating} style={styles.primaryBtn}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Turn Stories into <span style={styles.gradientText}>Cinematic Videos</span> with AI
        </h1>
        <p style={styles.heroSubtitle}>
          Generate multi-scene storyboards, produce character-consistent shots, and arrange
          them on a multi-track editor timeline[cite: 8, 14].
        </p>
        <button onClick={handleStartCreating} style={styles.ctaBtn}>
          🎬 Start Creating Project
        </button>
      </header>

      {/* Demo Showcase: Video Player + Timeline Editor */}
      <section style={styles.demoSection}>
        <div style={styles.demoWindow}>
          {/* Top Window Bar */}
          <div style={styles.windowHeader}>
            <div style={styles.windowDots}>
              <span style={{ ...styles.dot, backgroundColor: '#ef4444' }} />
              <span style={{ ...styles.dot, backgroundColor: '#eab308' }} />
              <span style={{ ...styles.dot, backgroundColor: '#22c55e' }} />
            </div>
            <span style={styles.windowTitle}>CineFlow Studio — Timeline Editor Demo</span>
            <span style={styles.timecodeDisplay}>{formatTime(currentTime)}</span>
          </div>

          {/* Video Preview Canvas from unsnplash */}
          <div style={styles.videoContainer}>
            <video
              ref={videoRef}
              src="https://github.com/dhanushankul/ModelDiagram/blob/main/big-buck-bunny-1080p-30sec.mp4"
              style={styles.videoPlayer}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
            />
            {!isPlaying && (
              <div style={styles.playOverlay} onClick={togglePlay}>
                <div style={styles.playIcon}>▶</div>
              </div>
            )}
          </div>

          {/* Timeline & Track Editor */}
          <div style={styles.timelineContainer}>
            {/* Timeline Controls */}
            <div style={styles.timelineBar}>
              <button onClick={togglePlay} style={styles.trackControlBtn}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <span style={styles.timelineLabel}>Timeline Playhead (Scrub to seek):</span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.05"
                value={currentTime}
                onChange={handleTimelineScrub}
                style={styles.scrubber}
              />
              <span style={styles.timelineLabel}>{formatTime(duration)}</span>
            </div>

            {/* Video Tracks */}
            <div style={styles.tracksWrapper}>
              {/* Playhead Vertical Line */}
              <div
                style={{
                  ...styles.playheadLine,
                  left: `${(currentTime / duration) * 100}%`,
                }}
              />

              {/* Video Track 1 */}
              <div style={styles.trackRow}>
                <span style={styles.trackHeader}>🎬 Video Track</span>
                <div style={styles.clipsArea}>
                  <div style={{ ...styles.clipBlock, width: '30%', backgroundColor: '#4338ca' }}>
                    Scene 1: Jungle Intro[cite: 13, 26]
                  </div>
                  <div style={{ ...styles.clipBlock, width: '35%', backgroundColor: '#6366f1' }}>
                    Scene 2: Ancient Temple[cite: 7]
                  </div>
                  <div style={{ ...styles.clipBlock, width: '35%', backgroundColor: '#4f46e5' }}>
                    Scene 3: Glowing Doorway[cite: 7]
                  </div>
                </div>
              </div>

              {/* Audio / SFX Track */}
              <div style={styles.trackRow}>
                <span style={styles.trackHeader}>🎵 Audio Track[cite: 2]</span>
                <div style={styles.clipsArea}>
                  <div style={{ ...styles.clipBlock, width: '65%', backgroundColor: '#059669' }}>
                    Cinematic Ambience (BGM)
                  </div>
                  <div style={{ ...styles.clipBlock, width: '35%', backgroundColor: '#0d9488' }}>
                    Temple Echo SFX
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={styles.features}>
        <div style={styles.featureCard}>
          <h3>Storyboard Studio</h3>
          <p>Turn raw story prompts into structured scene breakdowns with tailored camera angles[cite: 7, 26].</p>
        </div>
        <div style={styles.featureCard}>
          <h3>Character Consistency</h3>
          <p>Keep characters visually coherent across multiple generation cycles and transitions[cite: 2, 22].</p>
        </div>
        <div style={styles.featureCard}>
          <h3>Nonlinear Timeline</h3>
          <p>Sequence video clips, slice scenes, and preview output with synchronized audio[cite: 4, 14].</p>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#090d16',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 3rem',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 1.5rem 2.5rem',
    maxWidth: '850px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    lineHeight: '1.2',
    marginBottom: '1.2rem',
    fontWeight: '800',
  },
  gradientText: {
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  ctaBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '0.9rem 2rem',
    borderRadius: '8px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
  },
  demoSection: {
    maxWidth: '960px',
    margin: '0 auto 4rem',
    padding: '0 1.5rem',
  },
  demoWindow: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: '1px solid #334155',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
    overflow: 'hidden',
  },
  windowHeader: {
    backgroundColor: '#1e293b',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #334155',
  },
  windowDots: {
    display: 'flex',
    gap: '0.4rem',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  windowTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  timecodeDisplay: {
    fontFamily: 'monospace',
    color: '#38bdf8',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
    aspectRatio: '16/9',
    maxHeight: '440px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#fff',
    paddingLeft: '4px',
  },
  timelineContainer: {
    backgroundColor: '#111827',
    padding: '1rem',
    borderTop: '1px solid #1e293b',
  },
  timelineBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '1rem',
  },
  trackControlBtn: {
    backgroundColor: '#374151',
    border: 'none',
    color: '#fff',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  timelineLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  scrubber: {
    flex: 1,
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  tracksWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: '#ef4444',
    zIndex: 10,
    pointerEvents: 'none',
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    height: '38px',
    backgroundColor: '#1f2937',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #374151',
  },
  trackHeader: {
    width: '120px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#cbd5e1',
    paddingLeft: '0.75rem',
    backgroundColor: '#111827',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #374151',
    flexShrink: 0,
  },
  clipsArea: {
    flex: 1,
    display: 'flex',
    height: '100%',
    gap: '3px',
    padding: '3px',
  },
  clipBlock: {
    height: '100%',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0.5rem',
    fontWeight: '500',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
    maxWidth: '960px',
    margin: '0 auto 4rem',
    padding: '0 1.5rem',
  },
  featureCard: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    padding: '1.5rem',
    borderRadius: '8px',
  },
};

export default LandingPage;