import { isAudio, isImage, isPDF, isPreviewable, isVideo } from "@/helpers";
import {
    ArrowDownTrayIcon,
    PaperClipIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/solid";
import React, { useEffect, useRef, useState } from "react";
import AdvancedAudioPlayer from "./AdvancedAudioPlayer";
import CustomAudioPlayer from "./CustomAudioPlayer";

const MessageAttachments = ({ attachments, attachmentClick }) => {
    const [duration, setDuration] = useState(0);
    const audioREF = useRef(null);
    // console.log(
    //     attachments.map((attachment) => {
    //         return isAudio(attachment) && audioREF;
    //     })
    // );

    useEffect(() => {
        const audio = audioREF.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            if (audio.duration === Infinity) {
                // Force duration calculation trick
                audio.currentTime = 1e101;
                audio.ontimeupdate = () => {
                    audio.ontimeupdate = null;
                    audio.currentTime = 0;
                    setDuration(audio.duration);
                    console.log("Fixed duration:", audio.duration);
                };
            } else {
                setDuration(audio.duration);
                console.log("Normal duration:", audio.duration);
            }
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, []);

    return (
        <>
            {attachments.length > 0 && (
                // <div className="grid grid-cols-2 gap-2 w-fit">
                <div className="mt-2 flex flex-wrap  justify-center  items-center gap-1 ">
                    {attachments.map((attachment, index) => (
                        <div
                            onClick={(ev) =>
                                attachmentClick(attachments, index)
                            }
                            key={attachment.id}
                            className={
                                `group flex flex-col items-center justify-center text-gray-500 relative cursor-pointer  ` +
                                (isAudio(attachment)
                                    ? "w-60 sm:w-80"
                                    : "xs:w-28 sm:w-36 xl:w-44 w-[24vw] aspect-square bg-blue-100")
                            }
                        >
                            {!isAudio(attachment) && (
                                <a
                                    onClick={(ev) => ev.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="z-10 opacity-100 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center text-gray-100 bg-gray-700 rounded absolute top-0 right-0 cursor-pointer hover:bg-gray-800"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </a>
                            )}

                            {isImage(attachment) && (
                                <img
                                    src={attachment.url}
                                    className="xs:object-cover xs:aspect-square "
                                />
                            )}

                            {isVideo(attachment) && (
                                <div className="relative flex justify-center items-center">
                                    <PlayCircleIcon className="absolute w-16 h-16 text-white opacity-100" />

                                    <div className="absolute left-0 top-0 w-full h-full bg-black/55 "></div>
                                    <video
                                        src={attachment.url}
                                        className="object-contain aspect-square"
                                    ></video>
                                </div>
                            )}

                            {isAudio(attachment) && (
                                <div 
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-[360px] sm:w-[100%] md:flex-1 flex justify-center items-center">
                                    {/* <audio
                                        ref={audioREF}
                                        src={attachment.url}
                                        controls
                                        className="text-xs"
                                    ></audio> */}
                                    <AdvancedAudioPlayer
                                        fileUrl={attachment.url}
                                        attachment={attachment}
                                    />
                                    {/* {<CustomAudioPlayer file={attachment} />} */}
                                </div>
                            )}

                            {isPDF(attachment) && (
                                <div className="relative flex justify-center items-center">
                                    <div className="absolute left-0 top-0 bottom-0 right-0"></div>
                                    <iframe
                                        src={attachment.url}
                                        className="w-full h-full "
                                    ></iframe>
                                </div>
                            )}

                            {!isPreviewable(attachment) && (
                                <a
                                    onClick={(ev) => ev.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="flex flex-col justify-center items-center"
                                >
                                    <PaperClipIcon className="w-10 h-10 mb-3" />

                                    <small className="text-center text-ellipsis">
                                        {attachment.name}
                                    </small>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default MessageAttachments;
