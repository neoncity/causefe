import { Cause, CauseSummary } from '@neoncity/core-sdk-js'
import { Session, User } from '@neoncity/identity-sdk-js'


export function causeLink(cause: Cause|CauseSummary): string {
    return `/c/${cause.id}/${cause.slug}`;
}


export function causePictureUri(cause: Cause): string|undefined {
    if (cause == null) {
        return undefined;
    }
    
    if (cause.pictureSet.pictures.length == 0) {
        return undefined;
    }

    return cause.pictureSet.pictures[0].uri;
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
