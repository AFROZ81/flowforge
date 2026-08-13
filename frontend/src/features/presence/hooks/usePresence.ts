import { usePresenceContext } from "../context/PresenceContext";

export function usePresence() {
    return usePresenceContext();
}