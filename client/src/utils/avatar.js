export const getFullAvatarUrl = (url) => {
    if (!url) return "https://i.pravatar.cc/150";
    if (url.startsWith('http')) return url;

    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.hostname}:3001${normalizedPath}`;
};
