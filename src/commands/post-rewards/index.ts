import {Command, Flags} from '@oclif/core';
import {Client} from '@helium/http';
import * as moment from 'moment';
import { Balance, NetworkTokens, USDollars } from '@helium/currency';
import axios from 'axios';
import * as xml2js from 'xml2js';
import BigNumber from 'bignumber.js';
import { BookingData, BookingType, CreditDebit, Sevdesk, TaxType, Voucher, VoucherPos, VoucherStatus, VoucherType } from './sevdesk';

export default class PostRewards extends Command {
  static summary = 'Posts helium rewards to sevdesk account';

  static flags = {
    heliumAccount: Flags.string({description: 'Helium account id', required: true}),
    sevdeskApiToken: Flags.string({description: 'Sevdesk API Token', required: true}),
    sevdeskAccount: Flags.integer({description: 'Sevdesk Booking Account ID', required: true}),
    sevdeskCheckAccount: Flags.integer({description: 'Sevdesk Check Account ID', required: true}),
    sevdeskCostCentre: Flags.integer({description: 'Sevdesk Cost Centre ID', required: false}),
    date: Flags.string({description: 'The date to import the transactions for', required: true}),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(PostRewards);

    this.log(`Importing mining rewards from ${flags.date} for account ${flags.heliumAccount}`);

    BigNumber.config({ DECIMAL_PLACES: 10 });

    const exchangeRate = await this.fetchExchangeRate(flags.date);
    const transactions = await this.fetchHeliumTransactions(flags.heliumAccount, flags.date);
    this.calculateCurrencyValues(transactions, exchangeRate);

    const logNumberFormat = {decimalSeparator: ',', groupSeparator: '.', suffix: '€'};

    this.log('The following transactions were found:');
    let sum = new BigNumber(0);
    for (const transaction of transactions) {
      sum = sum.plus(transaction.euroPrice as BigNumber);

      this.log(`[${transaction.timestamp}] ${transaction.hash}: HNT ${transaction.amount.bigBalance.toString()} | value ${transaction.euroPrice?.toFormat(2, logNumberFormat)} | sum ${sum.decimalPlaces(2).toFormat(2, logNumberFormat)}`);
    }

    this.log('Adding transactions to sevdesk');
    this.createSevdeskBookings(flags.sevdeskApiToken, transactions, flags.date, flags.heliumAccount, flags.sevdeskAccount, flags.sevdeskCheckAccount, flags.sevdeskCostCentre);

    this.log('Import complete.');
  }

  /**
   * Creates sevdesk bookings from the transactions
   * @param transactions 
   * @param date 
   */
  async createSevdeskBookings(apiKey: string, transactions: Reward[], date: string, heliumAccountId: string, bookingAccountingId: number, checkAccountId: number, costCentreId?: number): Promise<void> {
    const sevdesk = new Sevdesk(apiKey);
    const documentDescription = `Helium Mining Rewards on ${date} for account ${heliumAccountId}`;

    // check for duplicates
    const existingVouchers = await sevdesk.getVoucher(documentDescription, date);
    if (existingVouchers.objects.length > 0) {
      this.warn(`Transactions were already created for account ${heliumAccountId} and date ${date}.`);
      return;
    }

    // create voucher
    const voucher: Voucher = {
      objectName: 'Voucher',
      voucherDate: date,
      supplierName: 'Helium Mining',
      description: documentDescription,
      status: VoucherStatus.Paid,
      deliveryDate: date,
      voucherType: VoucherType.Normal,
      creditDebit: CreditDebit.Debit,
      supplier: null,
      costCentre: !costCentreId ? null : {
        id: costCentreId,
        objectName: 'CostCentre',
      },
      taxType: TaxType.Default,
      document: null,
      payDate: null,
      mapAll: true,
    };

    const voucherPos: VoucherPos[] = [];
    for (const transaction of transactions) {
      voucherPos.push({
        objectName: 'VoucherPos',
        accountingType: {
          id: bookingAccountingId,
          objectName: 'AccountingType',
        },
        taxRate: 0,
        net: true,
        sumNet: transaction.euroPrice?.decimalPlaces(2).toNumber() || 0.0,
        sumGross: null,
        comment: `Mining Reward of ${transaction.amount.bigBalance.toNumber()} HNT at ${transaction.timestamp} (transaction hash ${transaction.hash})`,
        mapAll: true,
      });
    }

    const voucherResult = await sevdesk.createVoucher({voucher: voucher, voucherPosSave: voucherPos});
    const savedVoucher = voucherResult.objects.voucher;

    // book payment
    const booking: BookingData = {
        amount: savedVoucher.sumNet || 0,
        date: date,
        type: BookingType.Normal,
        checkAccount: {
          id: checkAccountId,
          objectName: 'CheckAccount',
        },
        checkAccountTransaction: null,
        createFeed: false,
    };
    await sevdesk.bookVoucher(savedVoucher.id!, booking);
  }

  /**
   * Enriches the transactions with USD and EUR values
   * @param transactions 
   * @param euroExchangeRate 
   */
  calculateCurrencyValues(transactions: Reward[], euroExchangeRate: ExchangeRate): void {
    for (const transaction of transactions) {
      transaction.usdPrice = transaction.amount.toUsd(transaction.oraclePrice).bigBalance;
      transaction.euroPrice = transaction.usdPrice.multipliedBy(euroExchangeRate.rate);
    }
  }

  /**
   * Fetches Helium transactions for a specific account and date
   * @param heliumAccount 
   * @param fetchDate 
   * @returns 
   */
  async fetchHeliumTransactions(heliumAccount: string, fetchDate: string): Promise<Reward[]> {
    const client = new Client();

    const fromDate = moment(fetchDate).startOf('day');
    const toDate = moment(fetchDate).endOf('day');
    
    const rewardObjects: Reward[] = [];
    for await (const reward of await client.accounts.fromAddress(heliumAccount).rewards.list({minTime: fromDate.toDate(), maxTime: toDate.toDate()})) {
      const oraclePrice = await client.oracle.getPriceAtBlock(reward.block);

      rewardObjects.push({
        hash: reward.hash,
        block: reward.block,
        amount: reward.amount,
        oraclePrice: oraclePrice.price as Balance<USDollars>,
        timestamp: reward.timestamp,
      });
    }

    return rewardObjects;
  }

  /**
   * Fetches the USD/EUR exchange rate from ECB
   * @param date 
   * @returns 
   */
  async fetchExchangeRate(date: string): Promise<ExchangeRate> {
    const result = await axios.get(
      `https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?startPeriod=${date}&endPeriod=${date}&format=structurespecificdata`,
      {
        headers: {
          'Accept': 'text/plain',
        },
      }
    );

    const xml = await xml2js.parseStringPromise(result.data);
    const payloadSeries = xml['message:StructureSpecificData']['message:DataSet'][0]['Series'][0];
    const payloadObs = payloadSeries.Obs[0]['$'];

    return {
      fromCurrency: payloadSeries['$'].CURRENCY,
      toCurrency: payloadSeries['$'].CURRENCY_DENOM,
      timePeriod: payloadObs.TIME_PERIOD,
      rate: new BigNumber(payloadObs.OBS_VALUE),
    };
  }
}

interface Reward {
  hash: string;
  block: number;
  amount: Balance<NetworkTokens>;
  oraclePrice: Balance<USDollars>;
  usdPrice?: BigNumber;
  euroPrice?: BigNumber;
  timestamp: string;
}

interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  timePeriod: string;
  rate: BigNumber;
}