# Loggit - Mobile

[![](https://github.com/BrunoBernardino/loggit-mobile/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/loggit-mobile/actions?workflow=Run+Tests)

This is the repo for the iOS and Android apps. Website is at https://loggit.net

**NOTE**: The mobile app is no longer available in the Play Store or App Store for ideological reasons. You can still build it from this repo yourself, or download + install the APK from the [Releases page](https://github.com/BrunoBernardino/loggit-mobile/releases). Personally, I'm using the [web app version](https://app.loggit.net) now for both mobile and desktop, though.

## Development

```bash
make install
make start
make pretty
make test
make deploy   # publishes to everyone (prod)
make build/android   # builds Android APK (manually added to releases)
```

See [an older commit](https://github.com/BrunoBernardino/loggit-mobile/tree/baf1b3288e88b2ee0a5158a7dc1c042435afc763#development) for other commands, related to building this for your iOS device.

## TODOs:

- [ ] Address `TODO`s in the code (UI-related)
