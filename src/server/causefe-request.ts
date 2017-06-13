import { RouterState } from 'react-router'

import { Request } from '@neoncity/common-server-js'


export interface CauseFeRequest extends Request {
    ssrRouterState: RouterState;
}
