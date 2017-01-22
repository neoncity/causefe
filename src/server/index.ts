import * as express from 'express';

import * as config from './config'; 

async function main() {

    const app = express();

    app.get('/hello', async (_: express.Request, res: express.Response) => {
        res.write('<!DOCTYPE html><html>Hello</html>');
        res.end();
    });

    app.listen(config.PORT, config.ADDRESS, () => {
	console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });

}

main();
