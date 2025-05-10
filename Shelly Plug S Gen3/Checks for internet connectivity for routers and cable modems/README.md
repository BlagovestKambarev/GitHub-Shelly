# Checks for internet connectivity for routers and cable modems / Проверява интернет свързаността за рутери и кабелни модеми

from / от: Blagovest Kambarev

In development!!
В процес на разработка!!

This Shelly script monitors internet connectivity and performs a relay off-on cycle if there is no internet connection for a specified number of checks. It also adds a scheduled task for automatically rebooting the router or modem at night or at a user-defined time.
The main purpose of this script is to connect your internet router or cable modem through the Shelly Plug S Gen3 device and automatically restart the router or modem if the internet connection is lost.

Този Shelly скрипт следи интернет свързаността и извършва цикъл изключване-включване на релето, ако няма интернет връзка за определен брой проверки. Също добавя и таск за автоматичното рестартиране на рутера или модема през нощя или желано от вас време.
Основната цел на този скрипт е да свърже вашия интернет рутер или кабелен модем през устройството Shelly Plug S Gen3 и автоматично да рестартира рутера или кабелния модем, ако интернет връзката прекъсне.

## Features / Функционалности

-	Periodic internet connectivity checks. / Периодични проверки на интернет свързаността.
-	Performs a Shelly relay off-on cycle after a specified number of failed internet checks. / Извършва цикъл изключване-включване на релето на Shelly след определен брой неуспешни проверки за интернет.
-	The script starts automatically when the device is powered on. / Скриптът се стартира автоматично при включване на устройството.
- Upon startup, the script automatically configures Shelly Plug S Gen3 devices to perform their intended function. / Скриптът при стартиране автоматично конфигурира Shelly Plug S Gen3 устройствота за да извърпва работата за която е предназначено.
- The script creates a scheduled task to reboot the router or modem at a specific time. / Скриптът създава времеви таск за рестартиране на Рутера или Модема в определен час.

## Installation / Инсталация

1. Copy the contents of `Checks for internet connectivity for routers and cable modems.js` to your Shelly device's script editor. / Копирайте съдържанието на `Checks for internet connectivity for routers and cable modems.js` във вградения редактор на скриптове на вашето Shelly устройство.
2. Configure the following settings / Конфигурирайте следните настройки:   
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

## Author / Автор

Blagovest Kambarev 09.05.2025

[GitHub Repository](https://github.com/BlagovestKambarev/GitHub-Shelly)

Inspired by this project: [ALLTERCO/shelly-script-examples](https://github.com/ALLTERCO/shelly-script-examples/blob/main/router-watchdog.js)
