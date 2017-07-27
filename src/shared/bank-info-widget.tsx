import * as React from 'react'

import { IBAN, IBANMarshaller } from '@neoncity/common-js/iban'
import { BankInfo } from '@neoncity/core-sdk-js'

import * as config from './config'
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
            let modifiersRegion = <span></span>;
            if (iban.isInvalid()) {
                modifiersRegion = <span className="modifiers warning">{text.invalidIBAN[config.LANG()]}</span>;
            } else if (iban.isModified()) {
                modifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
            }
            
            return (
                <div key={ibanIndex.toString()} className="form-line">
		    <div className="form-line-info">
		        <label>{text.IBAN[config.LANG()]}</label>
			{modifiersRegion}
		    </div>
		    <div className="form-line-info">
                        <input
                            className="value"
                            type="text"
                            value={iban.getUserInput()}
                            onChange={e => this._handleIBANChange(ibanIndex, e)}
                            placeholder={text.ibanInputPlaceholder[config.LANG()]} />
                        <button
                            className="action"
                            type="button"
                            onClick={_ => this._handleRemoveIBAN(ibanIndex)}>
                            <span className="warning-icon"/>                        
                            <span className="text">{commonText.remove[config.LANG()]}</span>
                        </button>
                    </div>
                </div>
            );
        });

        const noIBANsWarning = <p>{text.thereAreNoIBANs[config.LANG()]}</p>;

        const mainRegion = this.state.ibans.length == 0 ? noIBANsWarning : ibansRegion;
        
        return (
            <div className="bank-info-widget">
                <h3>{text.widgetTitle[config.LANG()]}</h3>
                <button
	            className="action add-iban"
                    disabled={this.state.ibans.length > BankInfo.MAX_NUMBER_OF_IBANS}
                    type="button"
                    onClick={this._handleAddIBAN.bind(this)}>
                    {text.addIBAN[config.LANG()]}
                </button>
                {mainRegion}
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
