import {
    PaperClipIcon,
    PhotoIcon,
    PaperAirplaneIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    ExclamationCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid";
import NewMessageInput from "./NewMessageInput";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AttachmentPreview from "./AttachmentPreview";
import { isAudio, isImage } from "@/helpers";
import AudioRecorder from "./AudioRecorder";
import { EmojiButton } from "@joeattardi/emoji-button";
import { createPortal } from "react-dom";
import { usePage } from "@inertiajs/react";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [errorSending, setErrorSending] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [choosenFiles, setChoosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const user = usePage().props.auth.user;

    const onFileChange = (ev) => {
        const files = ev.target.files;
        console.log(files);
        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file),
            };
        });

        setChoosenFiles((prevFiles) => {
            console.log([...prevFiles, ...updatedFiles]);
            return [...prevFiles, ...updatedFiles];
        });
    };
    useEffect(() => {
        console.log(choosenFiles);
    }, [choosenFiles]);

    // is code ka kaam hai input ko maintain rakhnay ka
    useEffect(() => {
        if (!conversation) return;

        const currentConversationId = conversation.is_user
            ? "user" + conversation.id
            : "group" + conversation.id;

        if (conversationId === null) {
            console.log("conversation id null hai");
            setConversationId(currentConversationId);
            return;
        }

        if (conversationId !== currentConversationId) {
            console.log(
                "conversation id alag hai, updating to new conversation id",
                currentConversationId
            );
            setConversationId(currentConversationId);
            setNewMessage("");
        }
        console.log(currentConversationId);
    }, [conversation]);

    const onSendClick = () => {
        if (messageSending) {
            console.log("not allow multiple clicks");
            return;
        }

        setMessageSending(true);

        if (newMessage.trim() === "" && choosenFiles.length === 0) {
            setInputErrorMessage(
                "Please provide a message or upload attachments"
            );
            setErrorSending(true);
            setTimeout(() => {
                setInputErrorMessage("");
                setMessageSending(false);
                setErrorSending(false);
            }, 2000);
            return;
        }

        const formData = new FormData();

        //add files from formDATA
        choosenFiles.forEach((file) => {
            formData.append("attachments[]", file.file);
        });

        formData.append("message", newMessage);
        formData.append("is_read", 0);
        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
            const createConversationId = [conversation.id, user.id].sort().join('_');
            formData.append("conversation_id", createConversationId);
        } else {
            formData.append("group_id", conversation.id);
        }

        // debug code hai
        //   formData.getAll('attachments[]').forEach((file, index) => {
        //     console.log(`File ${index}:`, file.name, file.size, file.type);
        //   });
        //   console.log(formData.getAll('attachments[]'))
        //   return;

        axios
            .post(route("message.store"), formData, {
                onUploadProgress: (ProgressEvent) => {
                    const progress = Math.round(
                        (ProgressEvent.loaded / ProgressEvent.total) * 100
                    );
                    console.log(progress);
                    setUploadProgress(progress);
                },
            })
            .then((res) => {
                // bottom mai scroll karwa rhe hai
                console.log(res)
                setNewMessage("");
            })
            .catch((error) => {
                const message = error?.response?.data?.message;
                setInputErrorMessage(
                    message || "An error occurred while sending message"
                );
                console.log(error);
            })
            .finally(() => {
                const container = document.querySelector("#messageCtrRef");
                if (container) {
                    setTimeout(() => {
                        container.scrollTop = container.scrollHeight;
                        console.log("scroll bottom done");
                    }, 50); // halka delay diya rendering ke liye
                }
                setMessageSending(false);
                setUploadProgress(0);
                setChoosenFiles([]);
            });
    };

    const onLikeClick = () => {
        if (messageSending) {
            return;
        }
        setMessageSending(true);
        const data = {
            message: "👍",
            is_read: 0,
        };

        if (conversation.is_user) {
            data["receiver_id"] = conversation.id;
            const createConversationId = [conversation.id, user.id].sort().join('_');
            data['conversation_id'] = createConversationId;
        } else if (conversation.is_group) {
            data["group_id"] = conversation.id;
        }

        axios
            .post(route("message.store"), data)
            .then((res) => {
                setMessageSending(false);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const recordedAudioReady = (file, url) => {
        setChoosenFiles((prevFiles) => [...prevFiles, { file, url }]);
    };

    const pickerRef = useRef(null);
    const buttonRef = useRef(null);
    const pickerContianerRef = useRef(document.createElement("div"));

    useEffect(() => {
        if (!pickerRef.current) {
            const picker = new EmojiButton({
                rootElement: pickerContianerRef.current,
                theme: "dark",
                autoHide: false,
            });
    
            picker.on("emoji", (selection) => {
                setNewMessage((prev) => prev + selection.emoji);
            });
    
            pickerRef.current = picker;
        }
    
       
    }, []);

    const togglePicker = () => {
        if (pickerRef.current) {
            pickerRef.current.togglePicker(buttonRef.current);
        }
    };

    return (
        <div
            className="flex flex-wrap items-center border-t border-slate-700 py-3"
            onClick={() => setInputErrorMessage("")}
        >
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
                <button className=" p-1 text-gray-400 hover:text-gray-300 relative">
                    <PaperClipIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0
                     cursor-pointer"
                    />
                </button>
                <button className=" p-1 text-gray-400 hover:text-gray-300 relative">
                    <PhotoIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        accept="image/*"
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0
                     cursor-pointer"
                    />
                </button>
                <AudioRecorder fileReady={recordedAudioReady} />
            </div>

            <div className="order-3 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative ">
                <div className="flex">
                    <NewMessageInput
                        value={newMessage}
                        onChange={(ev) => setNewMessage(ev.target.value)}
                        onSend={onSendClick}
                    />
                    <button
                        onClick={onSendClick}
                        className="btn btn-info rounded-1-none"
                        disabled={messageSending}
                    >
                        {messageSending && (
                            <span className="loading loading-spinner loading-xs"></span>
                        )}

                        {errorSending ? (
                            <ExclamationCircleIcon className="w-6" />
                        ) : (
                            <PaperAirplaneIcon className="w-6" />
                        )}
                        <span className="hidden sm:inline">
                            {errorSending ? "" : "Send"}
                        </span>
                    </button>
                </div>

                {!!uploadProgress && (
                    <progress
                        className="progress progress-info w-full"
                        value={uploadProgress}
                        max="100"
                    ></progress>
                )}

                {inputErrorMessage && (
                    <p className="text-sm p-2 text-red-600">
                        {inputErrorMessage}
                    </p>
                )}

                <div className="flex flex-wrap mt-2 gap-1 order-4">
                    {choosenFiles.map((file) => (
                        <div
                            key={file.file.name}
                            className={
                                `relative flex justify-between cursor-pointer` +
                                (isImage(file.file) ? "w-[240px]" : "")
                            }
                        >
                            {isImage(file.file) && (
                                <img
                                    src={file.url}
                                    alt={file.file.name}
                                    className="w-16 h-16 object-cover"
                                />
                            )}

                            {isAudio(file.file) && (
                                <CustomAudioPlayer
                                    file={file}
                                    showVolume={false}
                                />
                            )}

                            {!isAudio(file.file) && !isImage(file.file) && (
                                <AttachmentPreview file={file} />
                            )}

                            <button
                                onClick={() => {
                                    setChoosenFiles(
                                        choosenFiles.filter((f) => {
                                            return (
                                                f.file.name !== file.file.name
                                            );
                                        })
                                    );
                                }}
                                className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-gray-800 text-gray-300 hover:text-gray-100 z-10"
                            >
                                <XCircleIcon className="w-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="order-2 xs:order-3 p-2 flex">
                <div className="relative z-50 flex items-center gap-2">
                    <button
                        ref={buttonRef}
                        onClick={togglePicker}
                        className="p-1 text-gray-400 hover:text-gray-300"
                    >
                        <FaceSmileIcon className="w-6 h-6" />
                    </button>
                    {createPortal(
                        <div ref={pickerContianerRef} className="absolute z-50 "></div>,
                        document.getElementById("portal")
                    )}
                </div>
                <button
                    onClick={onLikeClick}
                    className="p-1 text-gray-400 hover:text-gray-300"
                >
                    <HandThumbUpIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
