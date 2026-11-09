type ShareFields = {
    title: string;
    host?: string;
    airTime?: string;
};

function closeSentence(lead: string) {
    const text = lead.trim();
    return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function showShareText(show: ShareFields) {
    const title = show.title.trim();
    const when = show.airTime?.trim();
    const host = show.host?.trim();
    const withHost = host ? ` with ${host}` : '';

    if (when) {
        return `${closeSentence(`${title} is on ${when}${withHost}`)} Come listen with us. Put it on, settle in, and enjoy the show on CASF Radio.`;
    }

    if (host) {
        return `${title} with ${host} is on CASF Radio. Come listen with us. Put it on, settle in, and enjoy the show.`;
    }

    return `${title} is on CASF Radio. Come listen with us. Put it on, settle in, and enjoy the show.`;
}
