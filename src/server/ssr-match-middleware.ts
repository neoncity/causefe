import * as express from 'express'
import { Location } from 'history'
import * as HttpStatus from 'http-status-codes'
import { match, RouterState } from 'react-router'

import { CauseFeRequest } from './causefe-request'


export function newServerSideRenderingMatchMiddleware(routesConfig: any) {
    return (req: CauseFeRequest, res: express.Response, next: express.NextFunction) => {
        match({ routes: routesConfig, location: req.url }, (err: Error, redirect: Location, routerState: RouterState) => {
            if (err) {
                req.log.error(err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.end();
                return;
            }

            if (redirect) {
                res.redirect(redirect.pathname + redirect.search);
                return;
            }

            if (!routerState) {
                res.status(HttpStatus.NOT_FOUND);
                res.end();
                return;
            }

            req.ssrRouterState = routerState;

            // Fire away.
            next();
        });
    };
}
