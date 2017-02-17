import Auth0Lock from 'auth0-lock'


export class Auth0Widget {
    private readonly _lock: Auth0LockStatic;

    constructor(clientId: string, domain: string) {
        this._lock = new Auth0Lock(clientId, domain,  {
	    closable: false,
	    languageDictionary: {
		title: 'NeonCity',
	    }
	});

        this._lock.on('authorization_error', this._authorizationError.bind(this));
	this._lock.on('unrecoverable_error', this._unrecoverableError.bind(this));
    }

    showLoginWidget() {
        this._lock.show();
    }

    // TODO(horia141): better error handling
    private _authorizationError(error: string) {
	console.log('Authentication Error', error);
    }

    // TODO(horia141): better error handling
    private _unrecoverableError(error: string) {
	console.log('Unrecoverable Error', error);
    }
}
