//
//Това е скрипт който служи са следното. Да настрои Shelly устройството да изпълнява функцията да следи има ли интернет
//и ако няма да рестартира рутера или кабления модем.
//
let CONFIG = {
  endpoints: [
    "https://global.gcping.com/ping",
    "https://us-central1-5tkroniexa-uc.a.run.app/ping",
  ],
  //number of failures that trigger the reset
  numberOfFails: 3,
  //time in seconds after which the http request is considered failed
  httpTimeout: 10,
  //time in seconds for the relay to be off
  toggleTime: 20,
  //time in seconds to retry a "ping"
  pingTime: 6,
  //time in minute to wait after turn off ruter, before next check internet
  waitTimeAfterTurnOffRuter: 10, //for debug = 1, normal = 10
  //number in count of turn of ruter
  numberTurnOffRuter: 2,
  //time in minute to wait after last turn off ruter
  waitTimeAferLastTurnOffRuter: 60, //for debug = 2, normal = 60
  //time in seconds to wait for start first start check internet
  waitTimeToFirstStartCheckInternet: 600 //for debug = 20, normal = 600
};

let endpointIdx = 0;
let failPingCounter = 0;
let pingTimer = null;
let waitTimerToNextPingCheck = null;
let waitTimerAfterLastRebooToNextPingCheck = null;
let rebootCounter = 0;

//
//
//
function NextCheckAfterReboot() {
  //Ако има активиран таймер за изчакване след рестарт на модема да се спре
  if (waitTimerToNextPingCheck !== null)
    Timer.clear(waitTimerToNextPingCheck);

  pingCheck();
}

//
//
//
function NextCheckAfterLastReboot() {
  //Ако има активиран таймер за изчакване след рестарт на модема да се спре
  if (waitTimerAfterLastRebooToNextPingCheck !== null)
    Timer.clear(waitTimerAfterLastRebooToNextPingCheck);

  pingCheck();
}

//
//
//
function setKVSValue(key, value, callback) {
  Shelly.call("KVS.Set", { key: key, value: value }, function(res, err_code, err_msg) {
    if (err_code === 0) {
      print("KVS key '" + key + "' успешно сетнат на:", value);
      if (callback) callback(true);
    } else {
      print("Грешка при сетване на KVS key '" + key + "':", err_msg);
      if (callback) callback(false, err_msg);
    }
  });
}

//
//
//
function getKVSValue(key, callback) {
  Shelly.call("KVS.Get", { key: key }, function(result, error_code, error_msg) {
    if (error_code === 0 && result && typeof result.value !== "undefined") {
      // Успешно четене – връщаме стойността чрез callback
      callback(result.value);
    } else {
      // Ключът не съществува или има грешка
      print("Грешка при четене на KVS key '" + key + "':", error_msg);
      callback(undefined);
    }
  });
}

//
//
//
function setKVSKey_AllReboot_IncreaseCounter(){
  getKVSValue("AllReboots", function(currentValue) {
    // Проверка дали стойността е валидно число
    var newValue = (typeof currentValue === "number" && !isNaN(currentValue)) 
      ? currentValue + 1 
      : 0; // Ако няма стойност или е невалидна, започваме от 0

    setKVSValue("AllReboots", newValue, function(success) {
      if(success) {
        print("AllReboots увеличено от " + currentValue + " → " + newValue);
      } else {
        print("Грешка при запис на новата стойност!");
      }
    });
  });
}

//
//
//
function pingEndpoints() {
  Shelly.call(
    "http.get",
    { url: CONFIG.endpoints[endpointIdx], timeout: CONFIG.httpTimeout },
    function (response, error_code, error_message) {
      //http timeout, magic number, not yet documented
      if (error_code === -114 || error_code === -104) {
        print("CHI-Failed to fetch ", CONFIG.endpoints[endpointIdx]);
        failPingCounter++;
        print("CHI-Rotating through endpoints");
        endpointIdx++;
        endpointIdx = endpointIdx % CONFIG.endpoints.length;
      } else {
        failPingCounter = 0;
        rebootCounter = 0;
        setKVSValue("Reboot", rebootCounter);
      }

      if (failPingCounter >= CONFIG.numberOfFails) {        
        print("CHI-Too many fails, resetting...");
        failPingCounter = 0;        
        Timer.clear(pingTimer);
        rebootCounter++;
        setKVSValue("Reboot", rebootCounter);
        setKVSKey_AllReboot_IncreaseCounter();
        print("CHI-REBOOT: ", rebootCounter);
        //set the output with toggling back
        Shelly.call(
          "Switch.Set",
          { id: 0, on: false, toggle_after: CONFIG.toggleTime },
          function () {}
        );   

        return;
      }
    }
  );
}

//
//
//
Shelly.addStatusHandler(function (status) {
  //print("CHI-addStatusHandler start ....");
  
  //is the component a switch
  if(status.name !== "switch") return;
  
  //is it the one with id 0
  if(status.id !== 0) return;
  
  //does it have a delta.source property
  if(typeof status.delta.source === "undefined") return;
  
  //is the source a timer
  if(status.delta.source !== "timer") return;
  
  //is it turned on
  if(status.delta.output !== true) return;
  
  print("CHI-addStatusHandler for ping chech ....");

  //start the loop to ping the endpoints again
  if (rebootCounter < CONFIG.numberTurnOffRuter) {
    //Пускаме таймер за изчакване м/у рестартирания за [waitTimeAfterTurnOffRuter] минути
    myPrint("CHI-Start wait timer to Next Ping Check ...: " + CONFIG.waitTimeAfterTurnOffRuter + " min");
    waitTimerToNextPingCheck = Timer.set(CONFIG.waitTimeAfterTurnOffRuter * 60 * 1000, true, NextCheckAfterReboot);
  }
  else {
    rebootCounter = 0;
    setKVSValue("Reboot", rebootCounter);
    //Пускаме таймер за изчакване след последното рестартиране за [waitTimeAferLastTurnOffRuter] минути
    myPrint("CHI-Start wait timer after last REBOOT to Next Ping Check ...:", CONFIG.waitTimeAferLastTurnOffRuter, "min");
    waitTimerAfterLastRebooToNextPingCheck = Timer.set(CONFIG.waitTimeAferLastTurnOffRuter * 60 * 1000, true, NextCheckAfterLastReboot);
  }

  //pingCheck();

});

//
//
//
function myPrint() {
  // Създаване на масив ръчно (за Shelly JS)
  let args = [];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  
  // Съединяване на аргументите в низ
  let msg = args.join(" ");
  
  setKVSValue("State", msg);
  print(msg);
}

//
//
//
function pingCheck() {
  myPrint("CHI-Start watchdog timer...: " + CONFIG.pingTime + " sec");
  pingTimer = Timer.set(CONFIG.pingTime * 1000, true, pingEndpoints);
}

//
// Функция за създаване на KVS променлива, ако не съществува
//
function createKVSIfNotExists(key, defaultValue) {
  Shelly.call("KVS.Get", { key: key }, function(res) {
    if (!res || typeof res.value === "undefined") {
      Shelly.call("KVS.Set", { key: key, value: defaultValue });
      print("KVS key '" + key + "' създаден със стойност:", defaultValue);
    } else {
      print("KVS key '" + key + "' вече съществува със стойност:", res.value);
    }
  });
}

//
//SETUP - с тази функция конфигурираме устройството правилно за управление на RUTER!
//
function SetupShellyForRouter() {
  let switch_config = Shelly.getComponentConfig("switch", 0);
  print("Конфигурация на реле 0:", JSON.stringify(switch_config));

  let sys_config = Shelly.getComponentConfig("sys");
  print("SNTP сървър:", sys_config.sntp.server);

  //създава KVS променливите
  // Създаване на целочислени променливи, ако не съществуват
  createKVSIfNotExists("AllReboots", 0);
  createKVSIfNotExists("Reboot", 0);
  createKVSIfNotExists("WaitTimer", 0);

  // Създаване на текстова променлива, ако не съществува
  createKVSIfNotExists("State", "...");

  //Задава името на реле 0  
  //Задава реле 0 винаги да е ВКЛЮЧЕНО при включване на устройството
  //Задава реле 0 да е в Detachet режим
  Timer.set(2000, false, 
    function(res) {
      Shelly.call("Switch.SetConfig", { id: 0, config: { 
                                                          auto_on: true,
                                                          auto_on_delay: 60,
                                                          name: "Router (O1)", //Задава името на реле 0
                                                          initial_state: "on", //Задава винаги при включване на Shelly устройството да е в On.
                                                          in_mode: "detached",   // Задава входът да не управлява релето
                                                          out_mode: "detached"   // Задава изходът не се влияе от входа
                                                        }
                                      }, 
        function(res, err_code, err_msg) {
          if (err_code === 0) {
            print("OK за релето");
          } else {
            print("Грешка при настройка на РЕЛЕТО:", err_msg);
          }
        }
      );
    }    
  );

  // Задава вход 0 в button режим.
  Timer.set(2500, false, 
    function(res) {
      Shelly.call("Input.SetConfig", {
        id: 0,
        config: {
          type: "button" // или "button" в зависимост от хардуера
        }
      }, function(res, err_code, err_msg) {
        if (err_code === 0) {
          print("Вход 0 е в detached mode!");
        } else {
          print("Грешка при detached mode:", err_msg);
        }
      });
    }    
  );

  Timer.set(3500, false, 
    function(res) {
      setSchedulesFroRuter();
    }
  );

}

//
//Задава графика за автоматичното рестартиране на рутер-модема всеки ден.
//
function setSchedulesFroRuter() {
  Shelly.call("Schedule.List", {}, 
    function(res, err_code, err_msg) {
      if (err_code !== 0 || !res || !res.jobs) {
        print("Грешка при взимане на списък с графици: ", err_code, err_msg, res.schedules);
        return;
      }

      let schedules = res.jobs;
      print("Намерени графици: " + schedules.length);

      if (schedules.length === 0) {
        // Няма графици за триене, създаваме нов график веднага
        createRouterSchedule();
        return;
      }

      let deleteErrors = 0;
      let deleteCount = 0;

      for (let i = 0; i < schedules.length; i++) {
        let schedule_id = schedules[i].id;
        Shelly.call("Schedule.Delete", { id: schedule_id }, 
          function(r, e, m) {
            if (e === 0) {
              print("Изтрит график с ID:", schedule_id);
            } else {
              print("Грешка при изтриване на график с ID:", schedule_id, m);
              deleteErrors++;
            }
            deleteCount++;
            // Когато всички изтривания приключат:
            if (deleteCount === schedules.length) {
              if (deleteErrors === 0) {
                createRouterSchedule();
              } else {
                print("Има грешки при изтриване на графици, нов график няма да бъде създаден!");
              }
            }
          }
        );
      }
    }
  );
}

//
// Функция за създаване на нов график
//
function createRouterSchedule() {
  Shelly.call("Schedule.Create", 
    {
      enable: true,
      timespec: "0 30 4 * * 0,1,2,3,4,5,6", // 04:30 всеки ден
      calls: [
        {
          method: "Switch.Set",
          params: { id: 0, on: false }
        }
      ]
    }, 
    function(res, err_code, err_msg) {
      if (err_code === 0) {
        print("Графикът е създаден успешно! ID:", res.id);
      } else {
        print("Грешка при създаване на график:", err_msg);
      }
    }
  );
}

//
//
//
SetupShellyForRouter();

//
//Пуска отложено за waitTimeToFirstStartCheckInternet секунди проверката за интернет.
//Отлагането е за да може да се изпълнят всички фунцкии по настройка на Shelly за работата му като
//WatchDog за рутер или модем, а и самия рутер да стартира и пусне интернета.
//
Timer.set(CONFIG.waitTimeToFirstStartCheckInternet * 1000, false, function(res) {
  pingCheck();
  return;
});


//За следваща версия:
//Проверка кога се свързва WiFi и кога се разкача, за да не рестартира рутера напразно. Да се помисли примерно след 10 минути ако няма WiFi да рестартира.
//При разкачане от WiFi да се обработи!!! 
//Проверка когато си взима IP тогава да пуска скрипта за проверка на интернета.
//Проверка периодична има ли WiFi и IP!!!
//Да се обмисли всичко около има няма интернет, рестарт на рутер и първоначално пуснаке!!!
