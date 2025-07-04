import { formatBytes, isPDF, isPreviewable, isVideo } from "@/helpers";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import React from "react";

const AttachmentPreview = ({ file }) => {
    console.log(file.file.type.split("/")[1]);
    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <div>
                {isPDF(file.file) && <img src="/img/pdf.png" className="w-8" />}
                {isVideo(file.file) && <img src="/img/video.png" className="w-8 " />}

                {!isPreviewable(file.file) && (
                    <div className="flex justify-center items-center w-10 h-10 bg-gray-700 rounded">
                        <PaperClipIcon className="w-6" />
                    </div>
                )}
            </div>
            <div className="flex-1 text-gray-400 text-nowrap text-ellipsis overflow-hidden">
                <h3>
                    {(file.file.name.length > 6
                        ? file.file.name.slice(0, 6) + "..."
                        : file.file.name)
                    + file.file.type.split('/')[1]    
                    } 
                </h3>
                

                <p className="text-xs">{formatBytes(file.file.size)}</p>
            </div>
        </div>
    );
};

export default AttachmentPreview;
