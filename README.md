# nest-influxdb-integration

Pipes data from a Nest thermostat into an influx server. Writes `nest_temperature_in_f`, `nest_humidity_in_pct`, `nest_setpoint_in_f`, and `nest_heat_on`. This is what I have for my system since I only have a furnace, but if you had AC as well it would be pretty easy to fork to update it I think.

Previously was written for InfluxDB 2.0. Take a look into git history if you use Influx instead. Arguably Influx is a better fit for this type of data than Prometheus, but I'm trying something new :)

## Configuration

Environment Variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

To get your `GOOGLE_*` environment variables, you'll need to follow the rather confusing setup for the Google APIs and go through an OAuth2.0 flow to get the refresh token. You will probably need to pay $5 to the overlords which means you're on the right path. [Follow instructions here (Pages 1 and 2)](https://developers.google.com/nest/device-access/get-started).

Will read and write to `access-token.txt` and you will want to ensure that this file persists between restarts (so bind it if running inside of Docker). This file will be created if it doesn't exist. You can prefill it with a valid Google access-token, but it's fine if not since the app will fetch a new one using the `GOOGLE_REFRESH_TOKEN` whenever needed.

Once your variables are set, just deploy it. It'll expose a Prometheus metrics endpoint on 0.0.0.0:8080

## Docker

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

Remember to map TCP 8080 to whatever port you want on the host and then configure Prometheus to scrape it

### Publishing instructions

```
npm run build
docker build . -t kj800x/nest-sensor
docker run --env-file .env -v ./access-token.txt:/app/access-token.txt -p 8080:8080 -t kj800x/nest-sensor
docker push kj800x/nest-sensor
```
