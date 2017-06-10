import { Cause } from '@neoncity/core-sdk-js'


export function causeLink(cause: Cause): string {
    return `/c/${cause.id}/${cause.slug}`;
}
