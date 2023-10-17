import { getData } from "./api.js";
import client from "prom-client";
import http from "http";

const metricsServer = http.createServer((__req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.writeHead(200);
  client.register.metrics().then((s) => {
    res.end(s);
  });
});

metricsServer.listen(8080, "0.0.0.0");

const nest_temperature_in_f = new client.Gauge({ name: "nest_temperature_in_f", help: "nest_temperature_in_f" });
const nest_humidity_in_pct = new client.Gauge({ name: "nest_humidity_in_pct", help: "nest_humidity_in_pct" });
const nest_setpoint_in_f = new client.Gauge({ name: "nest_setpoint_in_f", help: "nest_setpoint_in_f" });
const nest_heat_on = new client.Gauge({ name: "nest_heat_on", help: "nest_heat_on" });

function cToF(c: number): number {
  return c * 1.8 + 32;
}

async function main() {
  const data = await getData();

  if ("error" in data) {
    console.log(data);
    console.log("rate limited - skipping");
    return;
  }

  const humidity =
    data.devices[0]?.traits["sdm.devices.traits.Humidity"]
      .ambientHumidityPercent ?? NaN;

  const temperature =
    data.devices[0]?.traits["sdm.devices.traits.Temperature"]
      .ambientTemperatureCelsius ?? NaN;

  const setpoint: number =
    data.devices[0]?.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"]
      .heatCelsius ?? NaN;

  const heatOn =
    data.devices[0]?.traits["sdm.devices.traits.ThermostatHvac"].status ===
    "HEATING";

  console.log({
    humidity: humidity / 100,
    temperature: cToF(temperature),
    setpoint: cToF(setpoint),
    heat_on: heatOn,
  });

  nest_temperature_in_f.set(cToF(temperature));
  nest_setpoint_in_f.set(cToF(setpoint));
  nest_humidity_in_pct.set(humidity / 100);
  nest_heat_on.set(heatOn ? 1 : 0);
}

setInterval(main, 60000);
main();
