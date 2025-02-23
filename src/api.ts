import fetch from "node-fetch";
import { ENV, FILE_ENV } from "./env.js";

interface Device {
  name: string;
  type: string;
  assignee: string;
  traits: {
    "sdm.devices.traits.Info": {
      customName: string;
    };
    "sdm.devices.traits.Humidity": {
      ambientHumidityPercent: number;
    };
    "sdm.devices.traits.Connectivity": {
      status: string;
    };
    "sdm.devices.traits.Fan": {};
    "sdm.devices.traits.ThermostatMode": {
      mode: string;
      availableModes: string[];
    };
    "sdm.devices.traits.ThermostatEco": {
      availableModes: string[];
      mode: string;
      heatCelsius: number;
      coolCelsius: number;
    };
    "sdm.devices.traits.ThermostatHvac": {
      status: "OFF" | "HEATING" | "COOLING";
    };
    "sdm.devices.traits.Settings": {
      temperatureScale: string;
    };
    "sdm.devices.traits.ThermostatTemperatureSetpoint": {
      heatCelsius: number;
    };
    "sdm.devices.traits.Temperature": {
      ambientTemperatureCelsius: number;
    };
  };
  parentRelations: {
    parent: string;
    displayName: string;
  }[];
}

// curl -X GET 'https://smartdevicemanagement.googleapis.com/v1/enterprises/ed651520-8cc0-4e25-95c3-d9258db1f00b/devices' -H 'Content-Type: application/json' -H 'Authorization: Bearer XXXX'
interface ResponseSuccess {
  devices: Device[];
}

type Response =
  | ResponseSuccess
  | {
      error: {
        code: number;
        message: string;
        status: "RESOURCE_EXHAUSTED" | string;
      };
    };

// curl -L -X POST 'https://www.googleapis.com/oauth2/v4/token?client_id=XXXX&client_secret=XXXX&refresh_token=XXXX&grant_type=refresh_token'
interface RefreshResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

// Ok to default to empty string because it will be refreshed if invalid
let token = FILE_ENV("data/access-token", "");

async function refreshToken() {
  console.log("Refreshing Token");

  const clientSecret = ENV("GOOGLE_CLIENT_SECRET");
  const clientId = ENV("GOOGLE_CLIENT_ID");
  const refreshToken = ENV("GOOGLE_REFRESH_TOKEN");
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v4/token?client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
    {
      method: "POST",
    }
  );
  const json: RefreshResponse = (await response.json()) as RefreshResponse;
  token.set(json.access_token);
}

export async function getData(): Promise<Response> {
  const response = await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/ed651520-8cc0-4e25-95c3-d9258db1f00b/devices`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.get()}`,
      },
    }
  );

  const json: Response = (await response.json()) as Response;

  if ("error" in json && json.error.code === 401) {
    await refreshToken();

    const response = await fetch(
      `https://smartdevicemanagement.googleapis.com/v1/enterprises/ed651520-8cc0-4e25-95c3-d9258db1f00b/devices`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json: Response = (await response.json()) as Response;
    return json;
  }

  return json;
}
