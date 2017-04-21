import { Marshaller } from 'raynor'

import { isLocal } from '@neoncity/common-js/env'

import * as config from './config'


export class UserInput<T> {
    private readonly _value: T;
    private readonly _userInput: string;
    private readonly _modified: boolean;
    private readonly _invalid: boolean;

    constructor(value: T, userInput: string, modified: boolean = false, invalid: boolean = false) {
	this._value = value;
	this._userInput = userInput;
	this._modified = modified;
	this._invalid = invalid;
    }

    getValue(): T {
	return this._value;
    }

    getUserInput(): string {
	return this._userInput;
    }

    isModified(): boolean {
	return this._modified;
    }

    isInvalid(): boolean {
	return this._invalid;
    }
}


export class UserInputMaster<T> {
    private readonly _marshaller: Marshaller<T>;

    constructor(marshaller: Marshaller<T>) {
	this._marshaller = marshaller;
    }

    transform(userInput: string, oldValue: T): UserInput<T> {
	try {
	    let value = this._marshaller.extract(userInput);
	    return new UserInput<T>(value, userInput, true, false);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    return new UserInput<T>(oldValue, userInput, true, true);
	}
    }
}