import { getData } from "./api.js";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { ENV } from "./env.js";

const influx = new InfluxDB({
  url: ENV("INFLUX_URL"),
  token: ENV("INFLUX_TOKEN"),
});

const writeApi = influx.getWriteApi(ENV("INFLUX_ORG"), ENV("INFLUX_BUCKET"));

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

  const point = new Point("thermostat_reading");
  point.booleanField("heat_on", heatOn);
  if (!isNaN(cToF(temperature))) {
    point.floatField("temperature", cToF(temperature));
  }
  if (!isNaN(humidity)) {
    point.floatField("humidity", humidity / 100);
  }
  if (!isNaN(cToF(setpoint))) {
    point.floatField("setpoint", cToF(setpoint));
  }
  writeApi.writePoint(point);
  writeApi.flush();
}

setInterval(main, 60000);
main();
