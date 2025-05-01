import { useEffect, useRef } from "react";

const NewMessageInput = ({ value, onChange, onSend }) => {
    const input = useRef();

    const onInputKeyDown = (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            onSend();
        }
    };

    const onChangeEvent = (ev) => {
        setTimeout(() => {
            adjustHeight();
        }, 10);

        onChange(ev);
    };

    const adjustHeight = () => {
        setTimeout(() => {
            input.current.style.height = "auto";
            input.current.style.height = input.current.scrollHeight + 1 + "px";

            // if (input.current.scrollHeight > 160) { // 40 * 4 (4rem ka approx pixel)
            //     input.current.style.overflowY = 'auto';
            // } else {
            //     input.current.style.overflowY = 'hidden';
            // }
        }, 100);
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows="1"
            placeholder="Type a message"
            onKeyDown={onInputKeyDown}
            onChange={(ev) => onChangeEvent(ev)}
            className="input input-bordered w-full rounded-r-none resize-none overflow-y-auto max-h-40"
            style={{
                whiteSpace: "pre-wrap" /* Ensures line breaks and wrapping */,
                wordWrap: "break-word" /* Breaks long words that don't fit */,
                overflowX: "hidden" /* Prevents horizontal overflow */,
            }}
        ></textarea>
    );
};

export default NewMessageInput;
