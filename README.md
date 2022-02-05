# Helium Miner to Sevdesk

This project creates bookings in the cloud accounting software Sevdesk for rewards of helium mining.

> :warning: This project was developed for private use. The code is pretty static, not covered by unit tests, etc. I will not offer any support.
> 
> Please talk to you accountant before using this tool!
> 
> If you find any bugs, feel free to open a PR.

## Usage

It's suggested to run this using a cronjob.

<!-- usage -->
```sh-session
$ npm install -g helium-miner-sevdesk
$ helium-miner-sevdesk COMMAND
running command...
$ helium-miner-sevdesk (--version)
helium-miner-sevdesk/0.0.2 darwin-arm64 node-v17.4.0
$ helium-miner-sevdesk --help [COMMAND]
USAGE
  $ helium-miner-sevdesk COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install
$ npm run build
$ bin/run post-rewards --heliumAccount=YOUR-HELIUM-ACCOUNT-ID --date=THE-DATE-YOU-WANT-TO-IMPORT --sevdeskApiToken=YOUR-SEVDESK-API-TOKEN --sevdeskAccount=ID-OF-ACCOUNT-TO-BOOK --sevdeskCheckAccount=ID-OF-BANK-ACCOUNT-TO-BOOK-PAYMENT
...
```
