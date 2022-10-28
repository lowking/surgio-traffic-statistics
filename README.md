# surgio-traffic-statistics
![](https://img.shields.io/badge/license-GPL-blueviolet.svg)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![LICENSE](https://img.shields.io/badge/zx-v7.1.1-red.svg)](https://github.com/google/zx)
[![LICENSE](https://img.shields.io/badge/Thanks-Surgio-blue.svg)](https://github.com/surgioproject/surgio)
[![](https://tokei.rs/b1/github/lowking/surgio-traffic-statistics?category=code)](https://tokei.rs/b1/github/lowking/surgio-traffic-statistics?category=code)

- Dependency  
> [zx](https://github.com/google/zx)
- Copy ```sts``` to your bin path, and modify configration.
- Query provider traffic data.
```
sts get <provider name> [suffix]

like:
❯ sts get imm
$ mkdir -p /Users/lowking/surgio-traffic-statistics/imm/
$ curl -s 'http://domain/api/providers/imm/subscription'
{"status":"ok","data":{"upload":"775.06 MB","download":"30.37 GB","used":"31.15 GB","left":"505.72 GB","total":"536.87 GB","expire":"2023-02-26 (4 months)"}}$ touch /Users/lowking/surgio-traffic-statistics/imm//surgio-data-1666627818156
$ touch /Users/lowking/surgio-traffic-statistics/imm//surgio-pre-data
$ ls /Users/lowking/surgio-traffic-statistics/imm//surgio-data-* |grep -v "1666627818156" |xargs rm -f
Successed!
Upload  : 775.06 MB
Download: 30.37 GB
Used    : 31.15 GB
Left    : 505.72 GB

or:
❯ sts get imm dt
$ mkdir -p /Users/lowking/surgio-traffic-statistics/imm/dt
$ curl -s 'http://domain/api/providers/imm/subscription'
{"status":"ok","data":{"upload":"775.06 MB","download":"30.37 GB","used":"31.15 GB","left":"505.72 GB","total":"536.87 GB","expire":"2023-02-26 (4 months)"}}$ touch /Users/lowking/surgio-traffic-statistics/imm/dt/surgio-data-1666627839288
$ touch /Users/lowking/surgio-traffic-statistics/imm/dt/surgio-pre-data
$ ls /Users/lowking/surgio-traffic-statistics/imm/dt/surgio-data-* |grep -v "1666627839288" |xargs rm -f
Successed!
Upload  : 775.06 MB
Download: 30.37 GB
Used    : 31.15 GB
Left    : 505.72 GB

```
- View History
```
❯ sts log imm
or
❯ sts log imm dt

2022-10-25 00:10:18
Successed!
Upload  : 775.06 MB
Download: 30.37 GB
Used    : 31.15 GB
Left    : 505.72 GB

2022-10-25 00:30:00
Successed, 19.71min since last time!
Upload  : 777.58 MB - 775.06 MB（2.52 MB）
Download: 30.51 GB - 30.37 GB（143.36 MB）
Used    : 31.29 GB - 31.15 GB（143.36 MB）
Left    : 505.58 GB - 505.72 GB（143.36 MB）

```
- Setup your crontab
```
*/30 * * * * source /Users/lowking/.bash_profile && sts get imm
0 12 * * * source /Users/lowking/.bash_profile && sts get imm dt
```
