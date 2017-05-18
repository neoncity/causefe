export function saveAccessToken(accessToken: string) {
    localStorage.setItem('neoncity/access_token', accessToken);
}


export function loadAccessToken(): string|null {
    return localStorage.getItem('neoncity/access_token');
}


export function clearAccessToken() {
    return localStorage.removeItem('neoncity/access_token');
}