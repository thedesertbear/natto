## What is this Script?

natto is a wrapper script that runs a half-loop, running daily farming with garbo, performing other helpful daily tasks for you, and also acquiring and perming skills for you automatically. It provides basic profit-tracking, and includes calls to `garbo`, `loopgyou`, `instantsccs`, `CONSUME`, `gain`, and `PVP_MAB`.

## Installation


For in-flight development, use the main branch:

```text
git checkout https://github.com/thedesertbear/natto.git main
```

You will need to `git delete goorbo` before switching branches.

## How to Use

Run `natto`, with optional additional arguments (e.g.`natto permtier=2 astralpet="astral belt"`). To see a list of all available run-time settings, run `natto help`. To see a list of required / recommended items, skills, and familiars, run `natto sim`. To see details about what skills natto will target perming for you, run `natto simperms`.

## Who is Natto For?

It is aimed first and foremost at new players with few shinies, and it aims to complete after-prism leveling to level 13 without requiring any specific expensive or unobtainable item besides the Grey Goose, within 30 adventures, spending approximately 150k on potions, mojo filters and and spleen items with +exp% and +mainstat effects. It does support some IotMs and other expensive and/or hard-to-acquire items, and is expected to support more over time, but support for low-shiny players is the primary goal of goorbo. Shinier players may wish to fork natto and modify it for their own use.

## Cautions/Disclaimer/Support

This software is provided without any guarantee or warranty.
