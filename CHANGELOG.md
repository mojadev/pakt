# Changelog

## [0.5.4](https://github.com/mojadev/pakt/compare/v0.5.3...v0.5.4) (2023-05-02)


### Bug Fixes

* remove tests from build ([e176a44](https://github.com/mojadev/pakt/commit/e176a44ecc0075b68df72afe9c9cc91aad83181b))

## [0.5.3](https://github.com/mojadev/pakt/compare/v0.5.2...v0.5.3) (2023-05-02)


### Bug Fixes

* fix [@logger](https://github.com/logger) resolution ([025ec23](https://github.com/mojadev/pakt/commit/025ec237c31f3c78af49084f799c8e85ed0a159d))

## [0.5.2](https://github.com/mojadev/pakt/compare/v0.5.1...v0.5.2) (2023-05-02)


### Bug Fixes

* fix tsconfig.build ([94e67b4](https://github.com/mojadev/pakt/commit/94e67b412b69fe449ed65daf74c3ae61a43992fe))

## [0.5.1](https://github.com/mojadev/pakt/compare/v0.5.0...v0.5.1) (2023-05-02)


### Continuous Integration

* release 0.5.1 ([096965a](https://github.com/mojadev/pakt/commit/096965a01f316c7460a253f9325a30f0b1c795a7))

## [0.5.0](https://github.com/mojadev/pakt/compare/v0.4.1...v0.5.0) (2023-05-01)


### Features

* allow references to other documents (refs [#24](https://github.com/mojadev/pakt/issues/24)) ([e9e30ce](https://github.com/mojadev/pakt/commit/e9e30cea6e4532c02c0aa1a9581eb178b8f9a1d8))

## [0.4.1](https://github.com/mojadev/pakt/compare/v0.4.0...v0.4.1) (2023-04-08)


### Bug Fixes

* traverse through all references (refs [#52](https://github.com/mojadev/pakt/issues/52)) ([48337aa](https://github.com/mojadev/pakt/commit/48337aa361ac152dd7dd2134e7d8130300f060db))

## [0.4.0](https://github.com/mojadev/pakt/compare/v0.3.1...v0.4.0) (2023-04-07)


### Miscellaneous Chores

* release new minor version ([f58d3ce](https://github.com/mojadev/pakt/commit/f58d3ce176877b2f64ffcbd04a8589319d082f9f))

## [0.3.1](https://github.com/mojadev/pakt/compare/v0.3.0...v0.3.1) (2023-03-29)


### Bug Fixes

* explicit cast for zStringAsNumber to prevent unknown type ([e65fce2](https://github.com/mojadev/pakt/commit/e65fce2c4503d4650e151d1fc5f614760cef95e6))

## [0.3.0](https://github.com/mojadev/pakt/compare/v0.2.9...v0.3.0) (2023-03-29)


### Features

* add model-only deployment ([2684d0d](https://github.com/mojadev/pakt/commit/2684d0de5365f5cf4011ed26643b27f2067bb098))

## [0.2.9](https://github.com/mojadev/pakt/compare/v0.2.8...v0.2.9) (2023-03-29)


### Bug Fixes

* fix oneOf under array not working (refs [#44](https://github.com/mojadev/pakt/issues/44)) ([bf2be73](https://github.com/mojadev/pakt/commit/bf2be736063a98a9889da7cbd60150b8f9a581d3))
* fix union and intersection types not created correectly (refs [#44](https://github.com/mojadev/pakt/issues/44)) ([93d2c9b](https://github.com/mojadev/pakt/commit/93d2c9b58bbcfb1cf207f3ae66650465731e2b0d))

## [0.2.8](https://github.com/mojadev/pakt/compare/v0.2.7...v0.2.8) (2023-01-03)


### Bug Fixes

* remove string conversion of single-literal enum (refs: [#41](https://github.com/mojadev/pakt/issues/41)) ([f95e473](https://github.com/mojadev/pakt/commit/f95e47303b4bf1a061c2533811b68444ce283ed9))

## [0.2.7](https://github.com/mojadev/pakt/compare/v0.2.6...v0.2.7) (2023-01-01)


### Bug Fixes

* **mapper:** fix empty responses being mapped as */* type (refs 36) ([b56cb2a](https://github.com/mojadev/pakt/commit/b56cb2a492c0317fd3be12ae4dbd2c8a3b1e76d9))
* **types:** broaden response types in type declarations  (refs 37) ([b56cb2a](https://github.com/mojadev/pakt/commit/b56cb2a492c0317fd3be12ae4dbd2c8a3b1e76d9))

## [0.2.6](https://github.com/mojadev/pakt/compare/v0.2.5...v0.2.6) (2022-12-31)


### Bug Fixes

* **koa:** fix multiple mime types not handled correctly ([4c7f08b](https://github.com/mojadev/pakt/commit/4c7f08bf09c5de6f83a91486ff6f61ac7d0e9a04))

## [0.2.5](https://github.com/mojadev/pakt/compare/v0.2.4...v0.2.5) (2022-12-31)


### Bug Fixes

* **package:** add required dependencies ([4960511](https://github.com/mojadev/pakt/commit/496051190450b9ad07955e38aa90f4a02b56ad19))

## [0.2.4](https://github.com/mojadev/pakt/compare/v0.2.3...v0.2.4) (2022-12-31)


### Bug Fixes

* **cli:** add dependencies ([7b4c9bd](https://github.com/mojadev/pakt/commit/7b4c9bdc0c11cbabb6536ef0ba10172bb8440541))

## [0.2.3](https://github.com/mojadev/pakt/compare/v0.2.2...v0.2.3) (2022-12-31)


### Bug Fixes

* **publish:** do not test twice ([508f925](https://github.com/mojadev/pakt/commit/508f9255015b1f3cd773c1657a9d70e679275b93))

## [0.2.2](https://github.com/mojadev/pakt/compare/v0.2.1...v0.2.2) (2022-12-31)


### Bug Fixes

* **npmignore:** use proper .npmignore directives ([820c94c](https://github.com/mojadev/pakt/commit/820c94cc9236b43d2ccf96b744be97807a4fb7f3))

## [0.2.1](https://github.com/mojadev/pakt/compare/v0.2.0...v0.2.1) (2022-12-31)


### Bug Fixes

* **cli:** add missing hashbang for cli script (refs: 22) ([033a0c3](https://github.com/mojadev/pakt/commit/033a0c353a2738bbf0ff52b5763bfd3386f2e99d))

## [0.2.0](https://github.com/mojadev/pakt/compare/v0.1.1...v0.2.0) (2022-12-31)


### Features

* add bin field to package.json (refs: 12) ([699e8e1](https://github.com/mojadev/pakt/commit/699e8e15e2bec6bffdec44c90381c2ce1f3f33ea))

## [0.1.1](https://github.com/mojadev/pakt/compare/v0.1.0...v0.1.1) (2022-12-30)


### Features

* add example for koa-zod-errorhandler  (refs: 19) ([a547bf3](https://github.com/mojadev/pakt/commit/a547bf3447dfa1bcaf70166bc86b7141b277a5e8))


### Bug Fixes

* graceful shutdown of server ([a547bf3](https://github.com/mojadev/pakt/commit/a547bf3447dfa1bcaf70166bc86b7141b277a5e8))


### Continuous Integration

* enable release ([2932ab8](https://github.com/mojadev/pakt/commit/2932ab8b64ed434272acb44e1f11b2a91b2c84f0))

## 0.1.0 (2022-12-29)


### Features

* add additionalParameters with boolean (refs 5) ([183f42b](https://github.com/mojadev/pakt/commit/183f42be281cb7fa426517de72f78566bbf132e6))
* add literal type and enums (refs: 7) ([cd41eaf](https://github.com/mojadev/pakt/commit/cd41eaf3e38a183b53cb3759c9b37176798ea644))
* allow multi templatearg generics, add extends to interface ([5af3680](https://github.com/mojadev/pakt/commit/5af36804bec43df7090585493790cccdb7293e03))
* Initial Commit ([a821e52](https://github.com/mojadev/pakt/commit/a821e522cb5224910452dd3c19e118b6ad898683))
* support class extensions in type models ([183f42b](https://github.com/mojadev/pakt/commit/183f42be281cb7fa426517de72f78566bbf132e6))
* support structured requestbody ([183f42b](https://github.com/mojadev/pakt/commit/183f42be281cb7fa426517de72f78566bbf132e6))
* update release-please (refs: [#12](https://github.com/mojadev/pakt/issues/12)) ([34ceb64](https://github.com/mojadev/pakt/commit/34ceb64e5bcbe365cd039718ffc58c51ac849f1d))


### Bug Fixes

* fix union composite syntax error ([cd41eaf](https://github.com/mojadev/pakt/commit/cd41eaf3e38a183b53cb3759c9b37176798ea644))


### Miscellaneous Chores

* remove unused import ([46b15f9](https://github.com/mojadev/pakt/commit/46b15f9b1091fe60851543988b32927b4dba2030))
