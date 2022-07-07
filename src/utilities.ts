// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: Date) {
    const secondsDifference = (new Date().getTime() - date.getTime()) / 1000;

    let interval = secondsDifference / 31536000;
    if (interval > 1) { return `${Math.floor(interval)} year${interval >= 2 ? "s" : ""} ago`; }

    interval = secondsDifference / 2592000;
    if (interval > 1) { return `${Math.floor(interval)} month${interval >= 2 ? "s" : ""} ago`; }

    interval = secondsDifference / 86400;
    if (interval > 1) { return `${Math.floor(interval)} day${interval >= 2 ? "s" : ""} ago`; }

    interval = secondsDifference / 3600;
    if (interval > 1) { return `${Math.floor(interval)} hour${interval >= 2 ? "s" : ""} ago`; }
    
    interval = secondsDifference / 60;
    if (interval > 1) { return `${Math.floor(interval)} minute${interval >= 2 ? "s" : ""} ago`; }

    return `${Math.floor(interval)} seconds ago`;
}