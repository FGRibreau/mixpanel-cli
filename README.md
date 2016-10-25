### mixpanel-cli - A command-line tool to query Mixpanel API

![deps](https://img.shields.io/david/fgribreau/mixpanel-cli.svg?style=flat) ![Version](https://img.shields.io/npm/v/mixpanel-cli.svg?style=flat) ![extra](https://img.shields.io/badge/actively%20maintained-yes-ff69b4.svg?style=flat) [![available-for-advisory](https://img.shields.io/badge/available%20for%20consulting%20advisory-yes-ff69b4.svg?)](http://bit.ly/2c7uFJq) ![extra](https://img.shields.io/badge/actively%20maintained-yes-ff69b4.svg)


## Shameless plug

- [**Charts, simple as a URL**. No more server-side rendering pain, 1 url = 1 chart](https://image-charts.com)
- [Looking for a free **Redis GUI**?](http://redsmin.com) [Or for **real-time alerting** & monitoring for Redis?](http://redsmin.com)

<p align="center"><img src="https://cloud.githubusercontent.com/assets/138050/19687045/2f893296-9ac4-11e6-9c5b-fca23436c2bc.gif" alt="mixpanel cli" title="mixpanel cli"></p>

## Install

```
npm i mixpanel-cli -S
```

## Currently supported

```
$ mixpanel-cli

Commands:
  track                 Track an event
  people.set            Set properties on a user record
  people.set_once       Set properties on a user record, only if they do not yet exist
  people.increment      Increment/decrement numeric people analytics properties
  people.append         Append a value to a list-valued people analytics property
  people.union          Merge a given list with a list-valued people analytics property, excluding duplicate values
  people.track_charge   Record that you have charged the current user a certain amount of money
  people.clear_charges  Permanently clear all revenue report transactions from the current user's people analytics profile
  people.delete_user    Permanently deletes the current people analytics profile from Mixpanel (using the current distinct_id)

Options:
  -h, --help  Show help  [boolean]

@FGRibreau - https://twitter.com/FGRibreau
```

## Usage

First thing first, expose your mixpanel api key ("Project settings" > "Token") through an environment variable `MIXPANEL_API_KEY`.

```shell
export MIXPANEL_API_KEY="your_api_key"
```


### Track event

```shell
mixpanel track --distinct_id UNIQUE_USER_ID --event_name "User opened settings" --properties Country France Model "SM-T530"
```

### Set property to user profile

```shell
mixpanel people.set --distinct_id UNIQUE_USER_ID --prop MyProperty --to ValueToSet
```

### Add a property to a list of users (sequential)

```shell
echo "ID1\nID2" | xargs -I {ProfileID} mixpanel people.set  --distinct_id {ProfileID} --prop MyProperty --to ValueToSet
```

### Add a property to a list of users (parallel)

Same as above but does `10` requests in parallel (`-P 10`)!

```shell
cat user_ids.txt | xargs -P 10 -I {ProfileID} mixpanel people.set  --distinct_id {ProfileID} --prop MyProperty --to ValueToSet
```


## [Changelog](/CHANGELOG.md)
