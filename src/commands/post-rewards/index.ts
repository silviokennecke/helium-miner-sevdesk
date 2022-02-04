import {Command, Flags} from '@oclif/core';
import {Client} from '@helium/http';
import * as moment from 'moment';
import { Balance, NetworkTokens, USDollars } from '@helium/currency';
import axios from 'axios';
import * as xml2js from 'xml2js';
import BigNumber from 'bignumber.js';

export default class PostRewards extends Command {
  static summary = 'Posts helium rewards to sevdesk account';

  static flags = {
    heliumAccount: Flags.string({description: 'Helium account id', required: true}),
    sevdeskApiToken: Flags.string({description: 'Sevdesk API Token', required: false}),
    sevdeskCustomer: Flags.string({description: 'Sevdesk Customer Number', required: false}),
    sevdeskAccount: Flags.string({description: 'Sevdesk Account Number', required: false}),
    sevdeskCostCentre: Flags.string({description: 'Sevdesk Cost Centre Number', required: false}),
    date: Flags.string({description: 'The date to import the transactions for', required: true}),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(PostRewards);

    this.log(`importing mining rewards from ${flags.date}`);

    BigNumber.config({ DECIMAL_PLACES: 10 });

    const exchangeRate = await this.fetchExchangeRate(flags.date);
    const transactions = await this.fetchHeliumTransactions(flags.heliumAccount, flags.date);
    this.calculateCurrencyValues(transactions, exchangeRate);

    const logNumberFormat = {decimalSeparator: ',', groupSeparator: '.', suffix: '€'};

    let sum = new BigNumber(0);
    for (const transaction of transactions) {
      sum = sum.plus(transaction.euroPrice as BigNumber);

      this.log(`[${transaction.timestamp}] ${transaction.hash}: HNT ${transaction.amount.bigBalance.toString()} | value ${transaction.euroPrice?.toFormat(2, logNumberFormat)} | sum ${sum.decimalPlaces(2).toFormat(2, logNumberFormat)}`);
    }
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