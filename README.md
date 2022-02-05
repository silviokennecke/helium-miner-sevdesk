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
$ npm install
$ npm run build
$ bin/run post-rewards --heliumAccount=YOUR-HELIUM-ACCOUNT-ID --date=THE-DATE-YOU-WANT-TO-IMPORT --sevdeskApiToken=YOUR-SEVDESK-API-TOKEN --sevdeskAccount=ID-OF-ACCOUNT-TO-BOOK --sevdeskCheckAccount=ID-OF-BANK-ACCOUNT-TO-BOOK-PAYMENT
...
```
