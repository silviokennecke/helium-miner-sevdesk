import axios from 'axios';
import * as qs from 'qs';

export class Sevdesk {
    constructor(
        public apiKey: string
    ) {}

    protected async request(method: 'GET'|'POST'|'PUT'|'DELETE', path: string, payload?: any): Promise<any> {
        const result = await axios.request({
            method: method,
            url: 'https://my.sevdesk.de/api/v1' + path,
            data: method === 'GET' ? qs.stringify(payload) : payload,
            headers: {
                'Authorization': this.apiKey,
                ...(method === 'GET' ? {} : {'content-type': 'application/json'}),
            }
        });

        return result.data;
    }

    async getVoucher(description: string, date: string): Promise<ApiResponse<Voucher[]>> {
        return await this.request('GET', '/Voucher', {
            descriptionLike: description,
            startDate: date,
            endDate: date,
        });
    }

    async createVoucher(payload: {voucher: Voucher, voucherPosSave: VoucherPos[]}): Promise<ApiResponse<{voucher: Voucher, voucherPos: VoucherPos[]}>> {
        const requestPayload = {
            ...payload,
        };

        return await this.request('POST', '/Voucher/Factory/saveVoucher', requestPayload);
    }

    async bookVoucher(voucherId: number, bookingData: BookingData): Promise<ApiResponse<any>> {
        return await this.request('PUT', '/Voucher/' + voucherId + '/bookAmount', bookingData);
    }
}


export enum VoucherType {
    Normal = 'VOU',
    Recurring = 'RV',
}
export enum VoucherStatus {
    Draft = 50,
    Unpaid = 100,
    Paid = 10000,
}
export enum TaxType {
    Default = 'default',
    EU = 'eu',
    NotEU = 'noteu',
    Custom = 'custom',
}
export enum CreditDebit {
    Credit = 'C',
    Debit = 'D',
}

export interface ApiResponse<T> {
    objects: T;
}

export interface ObjectReference<N extends string> {
    id?: number|null;
    objectName?: N;
}

export interface Voucher extends ObjectReference<'Voucher'> {
    voucherDate: string;
    supplier: ObjectReference<'Contact'>|null;
    supplierName: string;
    description: string;
    document: ObjectReference<'Document'>|null;
    payDate: string|null;
    status: VoucherStatus;
    taxType: TaxType;
    creditDebit: CreditDebit;
    costCentre: ObjectReference<'CostCentre'>|null;
    voucherType: VoucherType;
    deliveryDate: string;
    mapAll: boolean;

    readonly sumNet?: number;
    readonly sumGross?: number;
}

export interface VoucherPos extends ObjectReference<'VoucherPos'> {
    accountingType: ObjectReference<'AccountingType'>;
    taxRate: number;
    net: boolean;
    sumNet: number|null;
    sumGross: number|null;
    comment: string;
    mapAll: boolean;
}

export enum BookingType {
    Normal = 'N',
    ReducedAmountDueToDiscount = 'CB', // skonto
    ReducedOrHigherAmountDueToCurrencyFluctuations = 'CF',
    ReducedOrHigherAmountDueToOtherReasons = 'O',
    HigherAmountDueToReminderCharges = 'OF',
    ReducedAmountDueToMonetaryTrafficCosts = 'MTC',
}

export interface BookingData {
    amount: number;
    date: string;
    type: BookingType;
    checkAccount: ObjectReference<'CheckAccount'>;
    checkAccountTransaction: ObjectReference<'CheckAccountTransaction'>|null;
    createFeed: boolean;
}