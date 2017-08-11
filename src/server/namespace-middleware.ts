import * as express from 'express'

import { Namespace } from 'continuation-local-storage'

import { CauseFeRequest } from './causefe-request'


export function newNamespaceMiddleware(ns: Namespace) {
    return (req: CauseFeRequest, res: express.Response, next: express.NextFunction): any => {
        ns.bindEmitter(req);
        ns.bindEmitter(res);

        ns.run(function() {
            next();
        });
    };
};
