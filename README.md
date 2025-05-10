# GitHub Shelly

from Blagovest Kambarev

This Shelly script monitors the internet connectivity and performs an off-on cycle on the relay if there is no internet connection for a specified number of checks.

The main purpose of this script is to connect your internet router through the Shelly device and automatically reboot the router if the internet connection is down. 

## Features

- Periodic internet connectivity checks.
- Performs Shelly relay off-on cycle after a specified number of failed internet checks.
- Script automatically starts on boot.

## Installation

1. Copy the contents of `Checks for internet connectivity for routers and cable modems.js` to your Shelly device's script editor.
2. Configure the following settings:
   
   
   - `numberOfFails`: 
      By default: 3
   - `httpTimeout` :
     By default: 10
   - `toggleTime` : 
     By default: 20
   - `pingTime` : 
     By default: 6
   - `waitTimeAfterTurnOffRuter` : 
     By default:10
   - `numberTurnOffRuter` : 
     By default: 2
   - `waitTimeAferLastTurnOffRuter` : 
     By default: 60
   - `waitTimeToFirstStartCheckInternet` : 
     By default: 600

## Author

Blagovest Kambarev 09.05.2025

[GitHub Repository](https://github.com/BlagovestKambarev/GitHub-Shelly)

Inspired by this project: [ALLTERCO/shelly-script-examples](https://github.com/ALLTERCO/shelly-script-examples/blob/main/router-watchdog.js)
