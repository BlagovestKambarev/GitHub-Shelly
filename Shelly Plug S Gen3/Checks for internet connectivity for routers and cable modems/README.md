# Checks for internet connectivity for routers and cable modems

from Blagovest Kambarev

Този Shelly скрипт следи интернет свързаността и извършва цикъл изключване-включване на релето, ако няма интернет връзка за определен брой проверки. Също добавя и таск за автоматичното рестартиране на рутера или модема през нощя или желано от вас време.
Основната цел на този скрипт е да свърже вашия интернет рутер или кабелен модем през устройството Shelly Plug S Gen3 и автоматично да рестартира рутера или кабелния модем, ако интернет връзката прекъсне.

## Функционалности

-	Периодични проверки на интернет свързаността.
-	Извършва цикъл изключване-включване на релето на Shelly след определен брой неуспешни проверки за интернет.
-	Скриптът се стартира автоматично при включване на устройството.
- Скриптът при стартиране автоматично конфигурира Shelly Plug S Gen3 устройствота за да извърпва работата за която е предназначено.
- Скриптът създава времеви таск за рестартиране на Рутера или Модема в определен час.

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
