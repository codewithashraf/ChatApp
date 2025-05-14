import { createContext, useContext, useState } from "react";

export const EventBusContext = createContext();

export const EventBusProvider = ({ children }) => {
    const [events, setEvents] = useState({});

    const emit = (name, data) => { 
        // debugger
        console.log('emit method call howa hai ', data)
        if(events[name]){
            for(let cb of events[name]){
                cb(data);
            }
            console.log(events)
        }
    }

    const on = (name, cb) => {
        console.log('on method call howa hai', name)
        if(!events[name]){
            events[name] = [];
        }

        events[name].push(cb); 

        return () => {
            events[name] = events[name].filter((callback) => callback !== cb);
        };
    }

    return (
        <EventBusContext.Provider value={{emit, on}}>
            {children}
        </EventBusContext.Provider>
    )
};

export const useEventBus = () =>{
    return useContext(EventBusContext);
}