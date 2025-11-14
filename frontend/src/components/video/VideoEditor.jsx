import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from 'react-player';
import { VideoProcessor } from '@services/video/videoProcessor';
import Timeline from './Timeline';
import VideoControls from './VideoControls';
import VideoEffects from './VideoEffects';
import { useVideoContext } from '@contexts/VideoContext';

const VideoEditor = () => {
  const { state, dispatch } = useVideoContext();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const playerRef = useRef(null);
  const videoProcessorRef = useRef(new VideoProcessor());

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      dispatch({
        type: 'SET_VIDEO',
        payload: { file, url },
      });
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
    dispatch({
      type: 'SET_DURATION',
      payload: duration,
    });
  };

  const handleProgress = (progress) => {
    setCurrentTime(progress.playedSeconds);
  };

  const handleSeek = (time) => {
    playerRef.current.seekTo(time);
    setCurrentTime(time);
  };

  const handleTrim = async () => {
    if (!videoFile || !state.trimStart || !state.trimEnd) return;

    setIsProcessing(true);

    try {
      const trimmedVideo = await videoProcessorRef.current.trimVideo(
        videoFile,
        state.trimStart,
        state.trimEnd
      );

      const url = URL.createObjectURL(trimmedVideo);
      setVideoUrl(url);
      setVideoFile(trimmedVideo);

      dispatch({
        type: 'SET_VIDEO',
        payload: { file: trimmedVideo, url },
      });
    } catch (error) {
      console.error('Trim error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMerge = async (files) => {
    setIsProcessing(true);

    try {
      const mergedVideo = await videoProcessorRef.current.mergeVideos(files);
      const url = URL.createObjectURL(mergedVideo);
      setVideoUrl(url);
      setVideoFile(mergedVideo);
    } catch (error) {
      console.error('Merge error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyFilter = async (filterName, options) => {
    if (!videoFile) return;

    setIsProcessing(true);

    try {
      const filteredVideo = await videoProcessorRef.current.applyFilter(
        videoFile,
        filterName,
        options
      );

      const url = URL.createObjectURL(filteredVideo);
      setVideoUrl(url);
      setVideoFile(filteredVideo);

      dispatch({
        type: 'ADD_FILTER',
        payload: { filterName, options },
      });
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeSpeed = async (speed) => {
    if (!videoFile) return;

    setIsProcessing(true);

    try {
      const speedVideo = await videoProcessorRef.current.changeSpeed(videoFile, speed);
      const url = URL.createObjectURL(speedVideo);
      setVideoUrl(url);
      setVideoFile(speedVideo);
    } catch (error) {
      console.error('Speed change error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractAudio = async () => {
    if (!videoFile) return;

    setIsProcessing(true);

    try {
      const audioBlob = await videoProcessorRef.current.extractAudio(videoFile, 'mp3');
      const url = URL.createObjectURL(audioBlob);

      // Download audio
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-audio.mp3';
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Audio extraction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateGIF = async () => {
    if (!videoFile) return;

    setIsProcessing(true);

    try {
      const gifBlob = await videoProcessorRef.current.createGIF(videoFile, {
        width: 480,
        fps: 10,
        startTime: state.trimStart || 0,
        duration: state.trimEnd ? state.trimEnd - state.trimStart : 5,
      });

      const url = URL.createObjectURL(gifBlob);

      // Download GIF
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.gif';
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('GIF creation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (format, quality) => {
    if (!videoFile) return;

    setIsProcessing(true);

    try {
      let exportedVideo;

      if (quality !== 'original') {
        exportedVideo = await videoProcessorRef.current.compressVideo(videoFile, {
          quality,
          resolution: format,
        });
      } else {
        exportedVideo = videoFile;
      }

      const url = URL.createObjectURL(exportedVideo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${quality}.mp4`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const processor = videoProcessorRef.current;
    const interval = setInterval(() => {
      if (isProcessing) {
        setProgress(processor.getProgress());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="video-editor h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="header bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Editor</h1>

          <div className="flex gap-2">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer transition"
            >
              Upload Video
            </label>

            <button
              onClick={() => handleExport('original', 'high')}
              disabled={!videoFile || isProcessing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Effects */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <VideoEffects
            onApplyFilter={handleApplyFilter}
            onChangeSpeed={handleChangeSpeed}
            disabled={!videoFile || isProcessing}
          />
        </div>

        {/* Center - Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            {videoUrl ? (
              <VideoPlayer
                ref={playerRef}
                url={videoUrl}
                playing={isPlaying}
                controls={false}
                width="100%"
                height="100%"
                onDuration={handleDuration}
                onProgress={handleProgress}
                progressInterval={100}
              />
            ) : (
              <div className="text-gray-500 text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xl">Upload a video to start editing</p>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <VideoControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            disabled={!videoFile}
          />
        </div>

        {/* Right Sidebar - Tools */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold mb-4">Tools</h3>

          <div className="space-y-4">
            <button
              onClick={handleTrim}
              disabled={!videoFile || isProcessing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 transition"
            >
              Trim Video
            </button>

            <button
              onClick={handleExtractAudio}
              disabled={!videoFile || isProcessing}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 transition"
            >
              Extract Audio
            </button>

            <button
              onClick={handleCreateGIF}
              disabled={!videoFile || isProcessing}
              className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded disabled:opacity-50 transition"
            >
              Create GIF
            </button>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="mb-2 text-sm">Processing... {progress}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 bg-gray-800 border-t border-gray-700">
        <Timeline
          duration={duration}
          currentTime={currentTime}
          onSeek={handleSeek}
          onTrimChange={(start, end) => {
            dispatch({
              type: 'SET_TRIM',
              payload: { start, end },
            });
          }}
          disabled={!videoFile}
        />
      </div>
    </div>
  );
};

export default VideoEditor;