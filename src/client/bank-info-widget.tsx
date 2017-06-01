import * as React from 'react'

import { IBAN, IBANMarshaller } from '@neoncity/common-js/iban'
import { BankInfo } from '@neoncity/core-sdk-js'

import { LANG } from './from-server'
import { UserInput, UserInputMaster } from './user-input'

import * as text from './bank-info-widget.text'
import * as commonText from './common.text'


interface BankInfoWidgetProps {
    bankInfo: BankInfo;
    onBankInfoChange: (newBankInfo: BankInfo) => void;
}


interface BankInfoWidgetState {
    ibans: UserInput<string, IBAN>[]
}


export class BankInfoWidget extends React.Component<BankInfoWidgetProps, BankInfoWidgetState> {
    private readonly _ibanMaster: UserInputMaster<string, IBAN>;
    
    constructor(props: BankInfoWidgetProps, context: any) {
        super(props, context);
        this.state = this._fullStateFromProps(props);
        this._ibanMaster = new UserInputMaster<string, IBAN>(new IBANMarshaller());
    }

    componentWillReceiveProps(newProps: BankInfoWidgetProps) {
        this.setState(this._fullStateFromProps(newProps));
    }
    
    render() {
        const ibansRegion = this.state.ibans.map((iban, ibanIndex) => {
            let modifiedRegion = <span></span>;
            if (iban.isModified()) {
                modifiedRegion = <span>{text.modified[LANG]}</span>;
            }
            
            let warningRegion = <span></span>;
            if (iban.isInvalid()) {
                warningRegion = <span>{text.invalidIBAN[LANG]}</span>;
            }
            
            return (
                <p key={ibanIndex.toString()}>
                    <input
                        type="text"
                        value={iban.getUserInput()}
                        onChange={e => this._handleIBANChange(ibanIndex, e)}
                        placeholder={text.ibanInputPlaceholder[LANG]} />
                    {modifiedRegion} {warningRegion}
                    <button type="button" onClick={_ => this._handleRemoveIBAN(ibanIndex)}>{commonText.remove[LANG]}</button>
                </p>
            );
        });
        
        return (
            <div>
                <p>{text.widgetTitle[LANG]}</p>
                <button
                    disabled={this.state.ibans.length > BankInfo.MAX_NUMBER_OF_IBANS}
                    type="button"
                    onClick={this._handleAddIBAN.bind(this)}>
                    {commonText.add[LANG]}
                </button>
                {ibansRegion}
            </div>
        );
    }

    private _fullStateFromProps(props: BankInfoWidgetProps): BankInfoWidgetState {
        return {
            ibans: props.bankInfo.ibans.map(iban => new UserInput<string, IBAN>(iban.toString(), iban))
        };
    }

    private _handleAddIBAN() {
        const newIbans = this.state.ibans.concat(new UserInput<string, IBAN>('', new IBAN('', '', '')));
        this.setState({ibans: newIbans}, this._updateOwner);
    }

    private _handleRemoveIBAN(ibanIndex: number) {
        const newIbans = this.state.ibans.slice(0);
        newIbans.splice(ibanIndex, 1);
        this.setState({ibans: newIbans}, this._updateOwner);
    }

    private _handleIBANChange(ibanIndex: number, e: React.FormEvent<HTMLInputElement>) {
        const newIbans = this.state.ibans.slice(0);
        newIbans[ibanIndex] = this._ibanMaster.transform(e.currentTarget.value, this.state.ibans[ibanIndex].getValue());
        this.setState({ibans: newIbans}, this._updateOwner);
    }

    private _updateOwner() {
        const allValid = this.state.ibans.every(iban => !iban.isInvalid());

        if (allValid) {
            const bankInfo = new BankInfo();
            bankInfo.ibans = this.state.ibans.map(iban => iban.getValue());
            this.props.onBankInfoChange(bankInfo);
        }
    }
}
