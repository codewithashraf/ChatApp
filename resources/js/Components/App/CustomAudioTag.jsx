import React, { useRef, useState, useEffect } from 'react';

const CustomAudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    // Set audio duration on load
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    // Update current time as the audio plays
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    // Cleanup event listeners on unmount
    return () => {
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  // Function to format time as HH:MM:SS
  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioSrc}></audio>
      
      <div className="audio-controls">
        <button onClick={togglePlay} className="play-pause-btn">
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Current Time & Total Duration */}
        <span className="current-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleProgressChange}
          className="progress-bar"
        />

        {/* Volume Control */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      <style jsx>{`
        .audio-player {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .play-pause-btn {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .current-time {
          font-size: 14px;
          color: #666;
        }
        .progress-bar {
          width: 200px;
        }
        .volume-slider {
          width: 100px;
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;
