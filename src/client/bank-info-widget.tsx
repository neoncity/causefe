import * as React from 'react'

import { IBAN, IBANMarshaller } from '@neoncity/common-js/iban'
import { BankInfo } from '@neoncity/core-sdk-js'

import { UserInput, UserInputMaster } from './user-input'


interface BankInfoWidgetProps {
    bankInfo: BankInfo;
    onBankInfoChange: (newBankInfo: BankInfo) => void;
}


interface BankInfoWidgetState {
    ibans: UserInput<IBAN>[]
}


export class BankInfoWidget extends React.Component<BankInfoWidgetProps, BankInfoWidgetState> {
    private static readonly _initialState = {
        ibans: []
    };

    private readonly _ibanMaster: UserInputMaster<IBAN>;
    
    constructor(props: BankInfoWidgetProps, context: any) {
        super(props, context);
        this.state = (Object as any).assign({}, BankInfoWidget._initialState);
        this._ibanMaster = new UserInputMaster<IBAN>(new IBANMarshaller());
    }
    
    render() {
        const ibansRegion = this.state.ibans.map((iban, ibanIndex) => {
            let modifiedRegion = <span></span>;
            if (iban.isModified()) {
                modifiedRegion = <span>Modified</span>;
            }
            
            let warningRegion = <span></span>;
            if (iban.isInvalid()) {
                warningRegion = <span>Invalid IBAN value</span>;
            }
            
            return (
                    <p key={ibanIndex.toString()}>
                    <input type="text" value={iban.getUserInput()} onChange={e => this._handleIBANChange(ibanIndex, e)} placeholder="Your IBAN..." />
                    {modifiedRegion} {warningRegion}
                    <button type="button" onClick={_ => this._handleRemoveIBAN(ibanIndex)}>Remove</button>
                    </p>
            );
        });
        
        return (
                <div>
                <p>Bank info</p>
                <button type="button" onClick={this._handleAddIBAN.bind(this)}>Add</button>
                {ibansRegion}
                </div>
        );
    }

    private _handleAddIBAN() {
        const newIbans = this.state.ibans.concat(new UserInput<IBAN>(new IBAN('', '', ''), ''));
        this.setState({ibans: newIbans});
    }

    private _handleRemoveIBAN(ibanIndex: number) {
        const newIbans = this.state.ibans.slice(0);
        newIbans.splice(ibanIndex, 1);
        this.setState({ibans: newIbans});
    }

    private _handleIBANChange(ibanIndex: number, e: React.FormEvent<HTMLInputElement>) {
        const newIbans = this.state.ibans.slice(0);
        newIbans[ibanIndex] = this._ibanMaster.transform(e.currentTarget.value, this.state.ibans[ibanIndex].getValue());
        this.setState({ibans: newIbans});
    }
}
