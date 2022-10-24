## What is this Script?

This is a full-day script for half-glooping. It aims to be a single-press script that will take you through your Aftercore and Grey You legs, collecting fat loot tokens, getting a Steel Liver, and leveling up to level 13 before running garbo. It will currently always choose for you to become a Seal Clubber, but longterm goals include becoming other classes to learn guild skills, and to perm learned skills upon ascension.

## Installation and Use

You can install this script with the following command:

```text
git checkout https://github.com/frazazel/goorbo.git release
```

If you'd like to contribute to testing, and get new features earlier, you can install the testing branch like this:

```text
git checkout https://github.com/frazazel/goorbo.git testing
```

Note that you should only install one or the other, as they both copy files with the same names to the same directory. I very much appreciate all of the feedback that testers are able to provide, and it allows me to continue to improve the script for players of all levels of shininess.

Type `goorbo` in kolmafia's GCLI to begin running the script. If you run it with the option `pvp` flag (i.e. `goorbo pvp`), it will break your Hippy Stone for you during your Grey You leg.

## Cautions and Disclaimers

Note that this is a very early version of the script that has run successfully for me, but it has not yet received much broader testing. I run a different fully-custom farming script, and I don't even farm meat in barf mountain at all. As such, I don't personally run this script, and there may be issues I am unaware of.

New features are pushed to the testing branch, where user feedback identifies errors, issues, and opportunities for improvement. Stable features and emergency fixes will be pushed to the release branch, which should run more reliably.

This script does not make specific use of very many IotMs at all, even if you have them. It is intended to be a starting point for new players who may not have experience with scripting a wrapper. It attempts to do the most important tasks in a run reasonably efficiently. Over time, I hope to incorporate support for more IotMs and other limited-availability skills/items, especially ones that are impactful and available to less shiny players.

## Requirements for this script to work:

- Have a Grey Goose in your terrarium.
- Have Curse of Weaksauce permed.
- Have sufficient progress / items for Kasekopf's loopgyou script to run successfully.
- Have some amount of liquid meat to diet, purchase buffs, etc.
- Set your `valueOfAdventure` preference appropriately for garbo to maximize your profits.

Non-IotM Recommendations for better results:

- lucky gold ring
- Mr. Cheeng's spectacles
- mafia thumb ring
- trench coat (also requires torso awareness)
- fake washboard

## What does this Script Do?

As of v0.1.1, it will do the following things for you:

### D2 Aftercore Leg

- Breakfast
- Daily Dungeon
- `garbo ascend`
- turn in FunFunds for a daypass
- PvP fites
- Ascend into Grey You, softcore, Vole, astral six pack, astral pet sweater

### Grey You Leg

- Pull lucky gold ring, Mr. Cheeng's spectacles, mafia thumb ring, one-day pass to Dinseylandfill
- (?) Break your hippy stone
- `loopgyou delaytower tune=wombat chargegoose=20`
- Farm barf mountain until ronin is over
- `pull all`
- `loopgyou delaytower chargegoose=20`
- Daily Dungeon
- Collect items for steel liver quest
- Farm barf mountain until 40 turns left
- Get +fam exp hatter buff
- Equip leveling outfit
- Break prism (become Seal Clubber)

### Grey You Leg - D1 Aftercore

- Get buffbot buffs
- Buff up with potions and spleen items
- Do leaflet quest & set up house in campground
- Open Bonerdagon chest
- Drink steel margarita
- use ghost dog chow to get familiar to 380+ exp
- Fight in Uncle Gators with high mainstat and low ML until level 13
- Use gooso stats when goose is fully charged
- Breakfast
- `garbo`
- turn in FunFunds for a daypass
- PvP fites
- Nightcap
- Put on pajamas and set up clockwork maid

It also provide profit-tracking, in terms of meat and items gained and lost during different tasks.

If you have any questions, comments or issues, you can contact frazazel on the ASS discord.
