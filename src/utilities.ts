// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: Date) {
    const secondsDifference = (new Date().getTime() - date.getTime()) / 1000
    let interval = secondsDifference / 31536000;
    if (interval > 1) { return `${Math.floor(interval)} years ago`; }
    interval = secondsDifference / 2592000;
    if (interval > 1) { return `${Math.floor(interval)} months ago`; }
    interval = secondsDifference / 86400;
    if (interval > 1) { return `${Math.floor(interval)} days ago`; }
    interval = secondsDifference / 3600;
    if (interval > 1) { return `${Math.floor(interval)} hours ago`; }
    interval = secondsDifference / 60;
    if (interval > 1) { return `${Math.floor(interval)} minutes ago`; }
    return `${Math.floor(interval)} seconds ago`;
}