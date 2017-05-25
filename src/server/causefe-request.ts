import { Request } from '@neoncity/common-server-js'
import { AuthInfo, Session } from '@neoncity/identity-sdk-js'


export interface CauseFeRequest extends Request {
    authInfo: AuthInfo;
    session: Session;
}
