import { formatTime } from "@/helpers";
import {
    MicrophoneIcon,
    PauseCircleIcon,
    PlayCircleIcon,
    SpeakerWaveIcon,
    StopCircleIcon,
  } from "@heroicons/react/16/solid";
  import React, { useEffect, useRef, useState } from "react"
  
  const AdvancedAudioPlayer = ({ fileUrl, attachment }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
  
    const audioRef = useRef(null);
    const controlAudioRef = useRef(null);

  
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !fileUrl) return;

        // jab audio load ho jaaye to duration set karo
        const handleLoadedMetadata = () => {
          const audio = audioRef.current;
    
          if (audio.duration === Infinity) {
            console.log(audio.duration);
            fixDuration(audio);
          } else {
            setDuration(audio.duration);
          }
        };
    
        const fixDuration = (audio) => {
          audio.currentTime = 1e101;
          audio.ontimeupdate = () => {
            audio.ontimeupdate = null;
            audio.currentTime = 0;
    
            console.log("autual duration", audio.duration);
            setDuration(audio.duration);
          };
        };
    
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            console.log('return hogaya metadata')
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
      }, [fileUrl]);
  
    const togglePlay = () => {
      const audio = audioRef.current;

      if (isPlaying) {

        audio.pause();

      } else {
        audio.play();
      }

      setIsPlaying(!isPlaying)
    };
  
    const volumeChange = (e) => {
      const newVolume = parseFloat(e.target.value);
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    };
  
    const timeoutRef = useRef(null);
  
    const handleSeekChange = (e) => {
      

      const value = Number(e.target.value);
      audioRef.current.pause();
      audioRef.current.currentTime = value;
      setCurrentTime(value);
      console.log(audioRef)
  
      if (!isPlaying) return;
  
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
  
      timeoutRef.current = setTimeout(() => {
        console.log("time out function chal gaya hai");
        audioRef.current.play();
      }, 300);
    };
  
   

    const onUpdateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
      if(audioRef.current.currentTime === audioRef.current.duration){
        setIsPlaying(false);
        setCurrentTime(0)
      }
    };
  
    return (
        <div className="bg-slate-950 text-white sm:rounded-xl rounded-lg xs:w-[240px] md:w-full flex items-center xs:gap-2  xs:px-4 xs:py-2 px-2  ">
          <div onClick={togglePlay}>
            {!isPlaying && <PlayCircleIcon className="md:w-10 w-6  text-gray-400" />}
            {isPlaying && <PauseCircleIcon className="md:w-10 w-6 text-gray-400" />}
          </div>
    
          <audio
            src={fileUrl}
            className="hidden"
            onTimeUpdate={onUpdateTime}
            ref={audioRef}
          ></audio>
    
          <div className="flex flex-col gap-1 sm:mt-5 mt-3 w-full ">
            <div>
              <input
                type="range"
                ref={controlAudioRef}
                min="0"
                max={duration}
                value={currentTime}
                onInput={handleSeekChange}
                step="0.000001"
                className="custom-range xs:w-full w-20 "
              />
            </div>
    
            <div className="flex items-center gap-3  justify-between">
              <div className="text-xs sm-text-md">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <SpeakerWaveIcon className="sm:w-6 w-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  value={volume}
                  onInput={volumeChange}
                  step="0.1"
                  className="volume-range xs:w-14 w-10"
                />
              </div>
            </div>
          </div>
        </div>
      );
  };
  
  export default AdvancedAudioPlayer;
  
  // **************************************************************
  