import * as React from 'react'

import { IBAN, IBANMarshaller } from '@neoncity/common-js/iban'
import { BankInfo } from '@neoncity/core-sdk-js'

import * as config from './config'
import { UserInput, UserInputMaster } from './user-input'

import * as text from './bank-info-widget.text'
import * as commonText from './common.text'


interface Props {
    bankInfo: UserInput<BankInfo, BankInfo>;
    onBankInfoChange: (newBankInfo: UserInput<BankInfo, BankInfo>) => void;
}


interface State {
    ibans: UserInput<string, IBAN>[];
    modified: boolean;
    invalid: boolean;
}


export class BankInfoWidget extends React.Component<Props, State> {
    private readonly _ibanMaster: UserInputMaster<string, IBAN>;
    
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = this._fullStateFromProps(props, false);
        this._ibanMaster = new UserInputMaster<string, IBAN>(new IBANMarshaller());
    }

    componentWillReceiveProps(newProps: Props) {
        this.setState(this._fullStateFromProps(newProps, true));
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

        let modifiersRegion = <span></span>;
        if (this.state.invalid) {
            modifiersRegion = <span className="modifiers warning">{text.invalidIBANs[config.LANG()]}</span>;
        } else if (this.state.modified) {
            modifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        }
        
        return (
            <div className="bank-info-widget">
                <h3>{text.widgetTitle[config.LANG()]} {modifiersRegion}</h3>
                <button
	            className="action add-iban"
                    disabled={this.state.invalid || this.state.ibans.length > BankInfo.MAX_NUMBER_OF_IBANS}
                    type="button"
                    onClick={this._handleAddIBAN.bind(this)}>
                    {text.addIBAN[config.LANG()]}
                </button>
                {mainRegion}
            </div>
        );
    }

    private _fullStateFromProps(props: Props, fromReupdate: boolean): State {
	if (!fromReupdate) {
	    return {
		modified: props.bankInfo.isModified(),
		invalid: props.bankInfo.isInvalid(),
		ibans: props.bankInfo.getValue().ibans.map(iban => new UserInput<string, IBAN>(iban.toString(), iban))
	    };
	} else {
	    if (props.bankInfo.isInvalid()) {
		return {
		    modified: props.bankInfo.isModified(),
		    invalid: props.bankInfo.isInvalid(),
		    ibans: this.state.ibans
		};
	    } else {
		return {
		    modified: props.bankInfo.isModified(),
		    invalid: props.bankInfo.isInvalid(),
		    ibans: props.bankInfo.getValue().ibans.map((iban, ibanIndex) => new UserInput<string, IBAN>(iban.toString(), iban, this.state.ibans[ibanIndex].isModified()))
		};
	    }
	}
    }

    private _handleAddIBAN() {
        const newIbans = this.state.ibans.concat(new UserInput<string, IBAN>('', new IBAN('', '', ''), false, true));
	
        this.setState({
	    modified: true,
	    invalid: true,
	    ibans: newIbans
	}, this._updateOwner);
    }

    private _handleRemoveIBAN(ibanIndex: number) {
        const newIbans = this.state.ibans.slice(0);
        newIbans.splice(ibanIndex, 1);
	
        this.setState({
	    modified: true,
	    invalid: !newIbans.every(iban => !iban.isInvalid()),
	    ibans: newIbans
	}, this._updateOwner);
    }

    private _handleIBANChange(ibanIndex: number, e: React.FormEvent<HTMLInputElement>) {
        const newIbans = this.state.ibans.slice(0);
        newIbans[ibanIndex] = this._ibanMaster.transform(e.currentTarget.value, this.state.ibans[ibanIndex].getValue());

        this.setState({
	    modified: true,
	    invalid: !newIbans.every(iban => !iban.isInvalid()),
	    ibans: newIbans
	}, this._updateOwner);
    }

    private _updateOwner() {
	const bankInfo = new BankInfo();
        bankInfo.ibans = this.state.ibans.map(iban => iban.getValue());
        this.props.onBankInfoChange(new UserInput<BankInfo, BankInfo>(bankInfo, bankInfo, this.state.modified, this.state.invalid));
    }
}
