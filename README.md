Environment Variables:
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `GOOGLE_REFRESH_TOKEN`
* `INFLUX_BUCKET`
* `INFLUX_ORG`
* `INFLUX_TOKEN`
* `INFLUX_URL`

Will read and write to `access-token.txt` and you will want to ensure that this file persists between restarts (so bind it if running inside of Docker)

```
docker build . -t nest-sensor
docker run --env-file .env -v ~/src/nest-sensor/access-token.txt:/app/access-token.txt -t nest-sensor
```