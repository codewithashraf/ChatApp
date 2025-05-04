import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useRef, useState } from "react";

const CustomAudioPlayer = ({ file, showVolume = true }) => {
    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

 

    const togglePlayPause = () => {
        const audio = audioRef.current;

        if (isPlaying) {
            audio.pause();
        } else {
            if (audio.duration === Infinity) {
                audio.currentTime = 1e101; // seek to huge value to force duration
                audio.ontimeupdate = () => {
                    audio.ontimeupdate = null; // run only once
                    audio.currentTime = 0; // reset to start
                    console.log("Actual duration:", audio.duration);
                    setDuration(audio.duration);
                };
            }
            console.log("audio duraiton", audio.duration);
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

   

    const handleTimeUpdate = (e) => {
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(e.target.currentTime);
    };


    const handleSeekChange = (e) => {
        const time = e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    useEffect(() => {
        if (
            audioRef.current &&
            audioRef.current.duration !== Infinity &&
            audioRef.current.currentTime === audioRef.current.duration
        ) {
            setIsPlaying(false);
            setDuration(0);
        }
    }, [audioRef?.current?.currentTime]);

    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <audio
                src={file.url}
                ref={audioRef}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="hidden"
            ></audio>
            <button onClick={togglePlayPause}>
                {isPlaying && <PauseCircleIcon className="w-6 text-gray-400" />}
                {!isPlaying && <PlayCircleIcon className="w-6 text-gray-400" />}
            </button>

            <input
                type="range"
                className="flex-1"
                min="0"
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeekChange}
            />
        </div>
    );
};

export default CustomAudioPlayer;
