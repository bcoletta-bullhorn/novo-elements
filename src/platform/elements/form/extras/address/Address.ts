// NG2
import {
    Component, forwardRef, Input, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
// APP
import { getCountries, getStates, getStateObjects, findByCountryName, findByCountryId } from '../../../../utils/countries/Countries';
import { NovoLabelService } from '../../../../services/novo-label-service';
import { Helpers } from '../../../../utils/Helpers';

// Value accessor for the component (supports ngModel)
const ADDRESS_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NovoAddressElement),
    multi: true
};

export interface NovoAddressSubfieldConfig {
    label: string;
    required: boolean;
}

export interface NovoAddressConfig {
    required?: boolean;
    address1?: NovoAddressSubfieldConfig;
    address2?: NovoAddressSubfieldConfig;
    city?: NovoAddressSubfieldConfig;
    state?: NovoAddressSubfieldConfig;
    zip?: NovoAddressSubfieldConfig;
    country?: NovoAddressSubfieldConfig;
}

@Component({
    selector: 'novo-address',
    providers: [ADDRESS_VALUE_ACCESSOR],
    template: `
        <span class="street-address" [class.invalid]="invalid.address1" [class.focus]="focused.address1">
            <i *ngIf="config?.address1?.required"
                class="required-indicator address1"
                [ngClass]="{'bhi-circle': !valid.address1, 'bhi-check': valid.address1}">
            </i>
            <input type="text" id="address1" name="address1" [placeholder]="config.address1.label" autocomplete="shipping street-address address-line-1" [(ngModel)]="model.address1" (ngModelChange)="updateControl()" (focus)="isFocused('address1')" (blur)="isBlurred('address1')" (input)="onInput('address1')"/>
        </span>
        <span class="apt suite" [class.invalid]="invalid.address2" [class.focus]="focused.address2">
            <i *ngIf="config?.address2?.required"
                class="required-indicator address2"
                [ngClass]="{'bhi-circle': !valid.address2, 'bhi-check': valid.address2}">
            </i>
            <input type="text" id="address2" name="address2" [placeholder]="config.address2.label" autocomplete="shipping address-line-2" [(ngModel)]="model.address2" (ngModelChange)="updateControl()" (focus)="isFocused('address2')" (blur)="isBlurred('address2')" (input)="onInput('address2')"/>
        </span>
        <span class="city locality" [class.invalid]="invalid.city" [class.focus]="focused.city">
            <i *ngIf="config?.city?.required"
                class="required-indicator"
                [ngClass]="{'bhi-circle': !valid.city, 'bhi-check': valid.city}">
            </i>
            <input type="text" id="city" name="city" [placeholder]="config.city.label" autocomplete="shipping city locality" [(ngModel)]="model.city" (ngModelChange)="updateControl()" (focus)="isFocused('city')" (blur)="isBlurred('city')" (input)="onInput('city')"/>
        </span>
        <span class="state region" [class.invalid]="invalid.state" [class.focus]="focused.state">
            <i *ngIf="config?.state?.required"
                class="required-indicator"
                [ngClass]="{'bhi-circle': !valid.state, 'bhi-check': valid.state}">
            </i>
            <novo-select id="state" [options]="states" [placeholder]="config.state.label" autocomplete="shipping region" [(ngModel)]="model.state" (ngModelChange)="onStateChange($event)"></novo-select>
        </span>
        <span class="zip postal-code" [class.invalid]="invalid.zip" [class.focus]="focused.zip">
            <i *ngIf="config?.zip?.required"
                class="required-indicator"
                [ngClass]="{'bhi-circle': !valid.zip, 'bhi-check': valid.zip}">
            </i>
            <input type="text" id="zip" name="zip" [placeholder]="config.zip.label" autocomplete="shipping postal-code" [(ngModel)]="model.zip" (ngModelChange)="updateControl()" (focus)="isFocused('zip')" (blur)="isBlurred('zip')" (input)="onInput('zip')" />
        </span>
        <span class="country-name" [class.invalid]="invalid.country" [class.focus]="focused.country">
            <i *ngIf="config?.country?.required"
                class="required-indicator"
                [ngClass]="{'bhi-circle': !valid.country, 'bhi-check': valid.country}">
            </i>
            <novo-select id="country" [options]="countries" [placeholder]="config.country.label" autocomplete="shipping country" [(ngModel)]="model.countryName" (ngModelChange)="onCountryChange($event)"></novo-select>
        </span>
    `
})
export class NovoAddressElement implements ControlValueAccessor, OnInit {
    @Input() config: NovoAddressConfig;
    states: Array<any> = [];
    countries: Array<any> = getCountries();
    fieldList: Array<string> = ['address1', 'address2', 'city', 'state', 'zip', 'country'];
    model: any;
    onModelChange: Function = () => {
    };
    onModelTouched: Function = () => {
    };
    focused: any = {};
    invalid: any = {};
    valid: any = {};

    constructor(public labels: NovoLabelService) { }

    ngOnInit() {
        if (!this.config) {
            this.config = {
            };
        }
        if (this.model) {
            this.writeValue(this.model);
            this.updateControl();
        } else if (!this.model) {
            this.model = {};
        }
        this.fieldList.forEach(((field: string) => {
            if (!this.config.hasOwnProperty(field)) {
                this.config[field] = {};
            }
            if (!this.config[field].hasOwnProperty('label')) {
                this.config[field].label = this.labels[field];
            }
            if (this.config.required) {
                this.config[field].required = true;
            }
        }));
    }

    isValid(field: string): void {
        let valid: boolean = true;
        if (((this.config[field].required && Helpers.isEmpty(this.model[field])) || !this.config[field].required) &&
            !(field === 'country' && this.config[field].required && !Helpers.isEmpty(this.model.countryName))) {
            valid = false;
        }
        this.valid[field] = valid;
    }

    isInvalid(field: string): void {
        let invalid: boolean = false;
        if (((this.config[field].required && Helpers.isEmpty(this.model[field]) && !Helpers.isBlank(this.model[field]))) &&
            !(field === 'country' && this.config[field].required && !Helpers.isEmpty(this.model.countryName) && !Helpers.isBlank(this.model.countryName))) {
            invalid = true;
        }
        this.invalid[field] = invalid;
    }

    onInput(field: string): void {
        this.isInvalid(field);
        this.isValid(field);
    }

    isFocused(field: string): void {
        this.focused[field] = true;
    }

    isBlurred(field: string): void {
        this.focused[field] = false;
    }

    onCountryChange(evt) {
        let country: any = findByCountryName(evt);
        if (country) {
            this.model.countryName = country.name;
            this.model.countryCode = country.code;
            this.model.countryID = country.id;
            this.updateStates();
        }

        // Update state
        this.model.state = undefined;
        this.updateControl();
        this.onInput('country');
    }

    onStateChange(evt) {
        this.model.state = evt;
        this.updateControl();
        this.onInput('state');
    }

    updateStates() {
        if (this.model.countryName) {
            this.states = getStates(this.model.countryName);
        } else {
            this.states = [];
        }
    }

    updateControl() {
        this.onModelChange(this.model);
    }

    writeValue(model: any): void {
        if (model) {
            let countryName;
            if (model.countryName) {
                countryName = model.countryName;
            } else if (model.countryID) {
                let country: any = findByCountryId(model.countryID);
                if (country) {
                    countryName = country.name;
                };
            }
            if (countryName) {
                countryName = countryName.trim();
                model.state = model.state || '';
                let stateObj: any = getStateObjects(countryName).find(state => {
                    return state.code === model.state.replace(/\W+/g, '').toUpperCase() || state.name === model.state;
                }) || {};
                this.model = Object.assign(model, { countryName: countryName, state: stateObj.name });
                this.updateStates();
            } else {
                this.model = model;
            }
        }
        this.fieldList.forEach((field: string) => {
            this.onInput(field);
        });
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }
}
