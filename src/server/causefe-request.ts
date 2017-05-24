import { Request } from '@neoncity/common-server-js'
import { Session } from '@neoncity/identity-sdk-js'


export interface CauseFeRequest extends Request {
    session: Session;
}