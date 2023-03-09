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
      .ambientHumidityPercent!;

  const temperature =
    data.devices[0]?.traits["sdm.devices.traits.Temperature"]
      .ambientTemperatureCelsius!;

  const setpoint =
    data.devices[0]?.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"]
      .heatCelsius!;

  const heatOn =
    data.devices[0]?.traits["sdm.devices.traits.ThermostatHvac"].status ===
    "HEATING";

  console.log({
    humidity: humidity / 100,
    temperature: cToF(temperature),
    setpoint: cToF(setpoint),
    heat_on: heatOn,
  });

  const point = new Point("thermostat_reading")
    .floatField("temperature", cToF(temperature))
    .floatField("humidity", humidity / 100)
    .floatField("setpoint", cToF(setpoint))
    .booleanField("heat_on", heatOn);
  writeApi.writePoint(point);
  writeApi.flush();
}

setInterval(main, 60000);
main();
