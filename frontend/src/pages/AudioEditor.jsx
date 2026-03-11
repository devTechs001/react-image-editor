// frontend/src/pages/AudioEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  Copy,
  Trash2,
  Plus,
  Undo2,
  Redo2,
  Download,
  Upload,
  Mic,
  Music,
  Sliders,
  Wand2,
  Save
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

const effects = [
  { id: 'normalize', name: 'Normalize', icon: Sliders },
  { id: 'fadeIn', name: 'Fade In', icon: Music },
  { id: 'fadeOut', name: 'Fade Out', icon: Music },
  { id: 'reverb', name: 'Reverb', icon: Wand2 },
  { id: 'echo', name: 'Echo', icon: Wand2 },
  { id: 'bass', name: 'Bass Boost', icon: Sliders },
  { id: 'treble', name: 'Treble Boost', icon: Sliders },
  { id: 'compress', name: 'Compress', icon: Sliders },
  { id: 'denoise', name: 'Noise Reduction', icon: Wand2 }
];

export default function AudioEditor() {
  const { projectId } = useParams();
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [tracks, setTracks] = useState([
    { id: 'track-1', name: 'Main Track', file: null, volume: 100, muted: false, solo: false }
  ]);
  const [activeTrack, setActiveTrack] = useState('track-1');

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(99, 102, 241, 0.5)',
        progressColor: '#6366f1',
        cursorColor: '#f43f5e',
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 128,
        normalize: true,
        responsive: true,
        fillParent: true,
        backend: 'WebAudio'
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current.getDuration());
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));

      // Load sample audio
      wavesurfer.current.load('/sample-audio.mp3');
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const skipBackward = () => {
    if (wavesurfer.current) {
      wavesurfer.current.skip(-5);
    }
  };

  const skipForward = () => {
    if (wavesurfer.current) {
      wavesurfer.current.skip(5);
    }
  };

  const handleVolumeChange = ([value]) => {
    setVolume(value);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(value / 100);
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (wavesurfer.current) {
      if (isMuted) {
        wavesurfer.current.setVolume(volume / 100);
      } else {
        wavesurfer.current.setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && wavesurfer.current) {
      const url = URL.createObjectURL(file);
      wavesurfer.current.load(url);
    }
  };

  const addTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      name: `Track ${tracks.length + 1}`,
      file: null,
      volume: 100,
      muted: false,
      solo: false
    };
    setTracks([...tracks, newTrack]);
    setActiveTrack(newTrack.id);
  };

  const removeTrack = (trackId) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(t => t.id !== trackId));
      if (activeTrack === trackId) {
        setActiveTrack(tracks[0].id);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-white">Audio Editor</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" icon={Undo2} />
            <Button variant="ghost" size="icon-sm" icon={Redo2} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={Save}>Save</Button>
          <Button variant="primary" size="sm" icon={Download}>Export</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Effects */}
        <div className="w-64 bg-editor-surface border-r border-editor-border flex flex-col">
          <div className="p-4 border-b border-editor-border">
            <h2 className="text-sm font-semibold text-white mb-3">Audio Effects</h2>
            <div className="space-y-2">
              {effects.map((effect) => (
                <button
                  key={effect.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all"
                >
                  <effect.icon className="w-4 h-4 text-surface-400" />
                  <span className="text-sm text-surface-300">{effect.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* EQ Section */}
          <div className="p-4 flex-1">
            <h3 className="text-sm font-semibold text-white mb-4">Equalizer</h3>
            <div className="space-y-4">
              {['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'].map((freq) => (
                <div key={freq} className="flex items-center gap-3">
                  <span className="text-xs text-surface-500 w-12">{freq}</span>
                  <Slider
                    value={[0]}
                    min={-12}
                    max={12}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Waveform */}
        <div className="flex-1 flex flex-col">
          {/* Upload Area / Waveform */}
          <div className="flex-1 flex flex-col p-4">
            {/* Waveform Container */}
            <div className="flex-1 bg-editor-card rounded-2xl border border-editor-border p-4 mb-4">
              <div ref={waveformRef} className="w-full" />
              
              {/* Time Display */}
              <div className="flex items-center justify-between mt-4 text-sm text-surface-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={skipBackward}
                className="p-3 rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all"
              >
                <SkipBack className="w-5 h-5 text-surface-300" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-glow hover:shadow-glow-lg transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="p-3 rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all"
              >
                <SkipForward className="w-5 h-5 text-surface-300" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 ml-4">
                <button onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-surface-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-surface-400" />
                  )}
                </button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    size="sm"
                  />
                </div>
              </div>

              {/* Record Button */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  'ml-4 p-3 rounded-xl border transition-all',
                  isRecording
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-editor-card border-editor-border text-surface-400 hover:text-white'
                )}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Tools */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" icon={Scissors}>Split</Button>
              <Button variant="ghost" size="sm" icon={Copy}>Duplicate</Button>
              <Button variant="ghost" size="sm" icon={Trash2}>Delete</Button>
              <div className="w-px h-6 bg-editor-border mx-2" />
              <label className="cursor-pointer">
                <Button variant="secondary" size="sm" icon={Upload} as="span">
                  Import Audio
                </Button>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Tracks */}
          <div className="h-48 bg-editor-surface border-t border-editor-border">
            <div className="h-10 flex items-center justify-between px-4 border-b border-editor-border">
              <span className="text-sm font-medium text-white">Tracks</span>
              <Button variant="ghost" size="sm" icon={Plus} onClick={addTrack}>
                Add Track
              </Button>
            </div>

            <div className="overflow-y-auto" style={{ height: 'calc(100% - 40px)' }}>
              {tracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => setActiveTrack(track.id)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 border-b border-editor-border cursor-pointer transition-all',
                    activeTrack === track.id
                      ? 'bg-primary-500/10'
                      : 'hover:bg-white/5'
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="flex-1 text-sm text-surface-300">{track.name}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = tracks.map(t =>
                          t.id === track.id ? { ...t, muted: !t.muted } : t
                        );
                        setTracks(updated);
                      }}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        track.muted
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-surface-800 text-surface-400'
                      )}
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = tracks.map(t =>
                          t.id === track.id ? { ...t, solo: !t.solo } : t
                        );
                        setTracks(updated);
                      }}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        track.solo
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-surface-800 text-surface-400'
                      )}
                    >
                      S
                    </button>
                    <div className="w-20">
                      <Slider
                        value={[track.volume]}
                        max={100}
                        size="sm"
                      />
                    </div>
                    {tracks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                        className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 bg-editor-surface border-l border-editor-border">
          <div className="p-4 border-b border-editor-border">
            <h2 className="text-sm font-semibold text-white">Properties</h2>
          </div>

          <div className="p-4 space-y-6">
            {/* Track Info */}
            <div>
              <h3 className="text-xs font-medium text-surface-500 mb-3">Track Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Duration</span>
                  <span className="text-white font-mono">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Sample Rate</span>
                  <span className="text-white font-mono">44.1 kHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Channels</span>
                  <span className="text-white font-mono">Stereo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Bit Depth</span>
                  <span className="text-white font-mono">16-bit</span>
                </div>
              </div>
            </div>

            {/* Master Volume */}
            <div>
              <Slider
                label="Master Volume"
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                valueSuffix="%"
              />
            </div>

            {/* Playback Speed */}
            <div>
              <Slider
                label="Playback Speed"
                value={[100]}
                min={25}
                max={200}
                valueSuffix="%"
              />
            </div>

            {/* AI Tools */}
            <div className="pt-4 border-t border-editor-border">
              <h3 className="text-xs font-medium text-surface-500 mb-3">AI Tools</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" fullWidth icon={Wand2}>
                  Voice Enhancement
                </Button>
                <Button variant="secondary" size="sm" fullWidth icon={Wand2}>
                  Noise Reduction
                </Button>
                <Button variant="secondary" size="sm" fullWidth icon={Wand2}>
                  Auto-Level
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}