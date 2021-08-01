# Loggit - Mobile

[![](https://github.com/BrunoBernardino/loggit-mobile/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/loggit-mobile/actions?workflow=Run+Tests)

This is the repo for the iOS and Android apps. Website is at https://loggit.net

## Development

```bash
make install
make start
make pretty
make test
make deploy   # publishes to everyone, prod
make build/ios   # builds iOS (to upload, use Transporter with the generated build)
make build/android   # builds Android
make upload/android   # uploads Android build to the Play Store
```

https://docs.expo.io/versions/v39.0.0/distribution/building-standalone-apps/#5-test-it-on-your-device-or for testing on iOS simulator (does NOT require `make build/ios`, `make deploy`)

## TODOs:

- [ ] Address `TODO`s in the code (UI-related)
