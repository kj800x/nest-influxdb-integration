# nest-influxdb-integration

Pipes data from a Nest thermostat into an influx server. Writes `temperature`, `humidity`, `setpoint`, and `heat_on`. This is what I have for my system since I only have a furnace, but if you had AC as well it would be pretty easy to fork to update it I think.

Supports InfluxDB 2.0 as that's what I'm running. Influx 1.8 also has an easy integration with Node so if you fork this you'd probably be able to update it to use that instead, it's just a different library and slightly different functions in `index.ts`.

## Configuration

Environment Variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `INFLUX_BUCKET`
- `INFLUX_ORG`
- `INFLUX_TOKEN`
- `INFLUX_URL`

To get your `GOOGLE_*` environment variables, you'll need to follow the rather confusing setup for the Google APIs and go through an OAuth2.0 flow to get the refresh token. You will probably need to pay $5 to the overlords which means you're on the right path. [Follow instructions here (Pages 1 and 2)](https://developers.google.com/nest/device-access/get-started).

Will read and write to `access-token.txt` and you will want to ensure that this file persists between restarts (so bind it if running inside of Docker). This file will be created if it doesn't exist. You can prefill it with a valid Google access-token, but it's fine if not since the app will fetch a new one using the `GOOGLE_REFRESH_TOKEN` whenever needed.

## Docker

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

### Publishing instructions

```
npm run build
docker build . -t @kj800x/nest-sensor
docker run --env-file .env -v ~/src/nest-sensor/access-token.txt:/app/access-token.txt -t kj800x/nest-sensor
docker push kj800x/nest-sensor
```
