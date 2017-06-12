import { Cause } from '@neoncity/core-sdk-js'
import { Session, User } from '@neoncity/identity-sdk-js'


export function causeLink(cause: Cause): string {
    return `/c/${cause.id}/${cause.slug}`;
}


export function inferLanguage(session: Session): string {
    if (session.hasUser()) {
        const user = session.user as User;
        if (user.language == 'en' || user.language == 'ro') {
            return user.language;
        } else {
            return 'en';
        }
    } else {
        return 'en';
    }
}
