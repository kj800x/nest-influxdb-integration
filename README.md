Environment Variables:
* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `GOOGLE_REFRESH_TOKEN`
* `INFLUX_BUCKET`
* `INFLUX_ORG`
* `INFLUX_TOKEN`
* `INFLUX_URL`

Will read and write to `access-token.txt` and you will want to ensure that this file persists between restarts (so bind it if running inside of Docker)

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

```
npm run build
docker build . -t @kj800x/nest-sensor
docker run --env-file .env -v ~/src/nest-sensor/access-token.txt:/app/access-token.txt -t @kj800x/nest-sensor
docker push @kj800x/nest-sensor
```