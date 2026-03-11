// frontend/src/pages/VideoEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Layers,
  Type,
  Image,
  Music,
  Film,
  Settings,
  Download,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function VideoEditor() {
  const { projectId } = useParams();
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedClip, setSelectedClip] = useState(null);

  const [tracks, setTracks] = useState([
    {
      id: 'video-1',
      type: 'video',
      name: 'Video Track 1',
      clips: [
        { id: 'clip-1', start: 0, duration: 5, name: 'Clip 1', color: '#6366f1' },
        { id: 'clip-2', start: 6, duration: 3, name: 'Clip 2', color: '#8b5cf6' }
      ]
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Audio Track 1',
      clips: [
        { id: 'audio-1', start: 0, duration: 8, name: 'Background Music', color: '#10b981' }
      ]
    },
    {
      id: 'text-1',
      type: 'text',
      name: 'Text Track',
      clips: [
        { id: 'text-1', start: 2, duration: 3, name: 'Title', color: '#f59e0b' }
      ]
    }
  ]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = ([value]) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const totalDuration = Math.max(
    ...tracks.flatMap(t => t.clips.map(c => c.start + c.duration)),
    10
  );

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-white">Video Editor</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" icon={Undo2} />
            <Button variant="ghost" size="icon-sm" icon={Redo2} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={Settings}>Settings</Button>
          <Button variant="primary" size="sm" icon={Download}>Export</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Media Library */}
        <div className="w-64 bg-editor-surface border-r border-editor-border flex flex-col">
          <div className="p-4 border-b border-editor-border">
            <h2 className="text-sm font-semibold text-white mb-3">Media</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Film, label: 'Video' },
                { icon: Image, label: 'Image' },
                { icon: Music, label: 'Audio' },
                { icon: Type, label: 'Text' }
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all"
                >
                  <item.icon className="w-5 h-5 text-surface-400" />
                  <span className="text-xs text-surface-400">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-xs font-medium text-surface-500 mb-3">Library</h3>
            <div className="space-y-2">
              {['Sample Video 1.mp4', 'Sample Video 2.mp4', 'Background Music.mp3'].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg bg-editor-card border border-editor-border hover:border-primary-500/30 cursor-pointer"
                  draggable
                >
                  <div className="w-12 h-8 rounded bg-surface-800 flex items-center justify-center">
                    <Film className="w-4 h-4 text-surface-500" />
                  </div>
                  <span className="text-sm text-surface-300 truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Preview and Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <div className="relative aspect-video max-h-full max-w-full bg-surface-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              >
                <source src="/sample-video.mp4" type="video/mp4" />
              </video>

              {/* Playback Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 p-3 rounded-xl bg-black/60 backdrop-blur-sm">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <span className="text-xs text-white font-mono min-w-[100px]">
                  {formatTime(currentTime)} / {formatTime(duration || totalDuration)}
                </span>

                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || totalDuration}
                    step={0.01}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full range-slider"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute}>
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-64 bg-editor-surface border-t border-editor-border">
            {/* Timeline Controls */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-editor-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" icon={Scissors} />
                <Button variant="ghost" size="icon-sm" icon={Copy} />
                <Button variant="ghost" size="icon-sm" icon={Trash2} />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" icon={ZoomOut} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} />
                <span className="text-xs text-surface-400 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon-sm" icon={ZoomIn} onClick={() => setZoom(z => Math.min(3, z + 0.1))} />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" icon={Plus}>Add Track</Button>
              </div>
            </div>

            {/* Timeline Tracks */}
            <div ref={timelineRef} className="flex-1 overflow-auto">
              {/* Time Ruler */}
              <div className="h-6 bg-editor-card border-b border-editor-border flex items-center sticky top-0 z-10">
                <div className="w-48 flex-shrink-0 border-r border-editor-border" />
                <div 
                  className="flex-1 relative h-full"
                  style={{ width: `${totalDuration * 100 * zoom}px` }}
                >
                  {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 flex flex-col justify-between"
                      style={{ left: `${i * 100 * zoom}px` }}
                    >
                      <div className="h-2 w-px bg-surface-600" />
                      <span className="text-2xs text-surface-500">{i}s</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracks */}
              <div className="relative">
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-20"
                  style={{ left: `${192 + currentTime * 100 * zoom}px` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
                </div>

                {tracks.map((track) => (
                  <div key={track.id} className="flex h-16 border-b border-editor-border">
                    {/* Track Header */}
                    <div className="w-48 flex-shrink-0 flex items-center gap-3 px-4 bg-editor-card border-r border-editor-border">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        track.type === 'video' && 'bg-primary-500',
                        track.type === 'audio' && 'bg-emerald-500',
                        track.type === 'text' && 'bg-amber-500'
                      )} />
                      <span className="text-sm text-surface-300 truncate">{track.name}</span>
                    </div>

                    {/* Track Content */}
                    <div 
                      className="flex-1 relative bg-editor-bg"
                      style={{ width: `${totalDuration * 100 * zoom}px` }}
                    >
                      {track.clips.map((clip) => (
                        <motion.div
                          key={clip.id}
                          className={cn(
                            'absolute top-1 bottom-1 rounded-lg cursor-pointer',
                            'border-2 border-transparent',
                            selectedClip === clip.id && 'border-white'
                          )}
                          style={{
                            left: `${clip.start * 100 * zoom}px`,
                            width: `${clip.duration * 100 * zoom}px`,
                            backgroundColor: clip.color
                          }}
                          onClick={() => setSelectedClip(clip.id)}
                          whileHover={{ y: -2 }}
                        >
                          <div className="p-2 truncate">
                            <span className="text-xs text-white font-medium">{clip.name}</span>
                          </div>

                          {/* Resize Handles */}
                          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30" />
                          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 bg-editor-surface border-l border-editor-border">
          <div className="p-4 border-b border-editor-border">
            <h2 className="text-sm font-semibold text-white">Properties</h2>
          </div>

          {selectedClip ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input input-sm"
                  value="Clip 1"
                  onChange={() => {}}
                />
              </div>

              <div>
                <label className="label">Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="input input-sm"
                    value="5.00"
                    onChange={() => {}}
                  />
                  <span className="text-sm text-surface-500">sec</span>
                </div>
              </div>

              <Slider label="Opacity" value={[100]} max={100} valueSuffix="%" />
              <Slider label="Speed" value={[100]} min={25} max={400} valueSuffix="%" />

              <div className="pt-4 border-t border-editor-border">
                <h3 className="text-sm font-medium text-white mb-3">Effects</h3>
                <Button variant="secondary" size="sm" fullWidth icon={Plus}>
                  Add Effect
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-surface-500">
              <p className="text-sm">Select a clip to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}