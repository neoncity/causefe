import { Marshaller } from 'raynor'


export class UserInput<TIn, TOut> {
    private readonly _userInput: TIn;
    private readonly _value: TOut;
    private readonly _modified: boolean;
    private readonly _invalid: boolean;

    constructor(userInput: TIn, value: TOut, modified: boolean = false, invalid: boolean = false) {
        this._userInput = userInput;
        this._value = value;
        this._modified = modified;
        this._invalid = invalid;
    }

    getUserInput(): TIn {
        return this._userInput;
    }

    getValue(): TOut {
        return this._value;
    }

    isModified(): boolean {
        return this._modified;
    }

    isInvalid(): boolean {
        return this._invalid;
    }
}


export class UserInputMaster<TIn, TOut> {
    private readonly _marshaller: Marshaller<TOut>;

    constructor(marshaller: Marshaller<TOut>) {
        this._marshaller = marshaller;
    }

    transform(userInput: TIn, oldValue: TOut): UserInput<TIn, TOut> {
        try {
            let value = this._marshaller.extract(userInput);
            return new UserInput<TIn, TOut>(userInput, value, true, false);
        } catch (e) {
            if (e.name === 'ExtractError') {
                return new UserInput<TIn, TOut>(userInput, oldValue, true, true);
            }

            throw e;
        }
    }
}
