oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g helium-miner-sevdesk
$ helium-miner-sevdesk COMMAND
running command...
$ helium-miner-sevdesk (--version)
helium-miner-sevdesk/0.0.0 darwin-arm64 node-v17.4.0
$ helium-miner-sevdesk --help [COMMAND]
USAGE
  $ helium-miner-sevdesk COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`helium-miner-sevdesk hello PERSON`](#helium-miner-sevdesk-hello-person)
* [`helium-miner-sevdesk hello world`](#helium-miner-sevdesk-hello-world)
* [`helium-miner-sevdesk help [COMMAND]`](#helium-miner-sevdesk-help-command)
* [`helium-miner-sevdesk plugins`](#helium-miner-sevdesk-plugins)
* [`helium-miner-sevdesk plugins:inspect PLUGIN...`](#helium-miner-sevdesk-pluginsinspect-plugin)
* [`helium-miner-sevdesk plugins:install PLUGIN...`](#helium-miner-sevdesk-pluginsinstall-plugin)
* [`helium-miner-sevdesk plugins:link PLUGIN`](#helium-miner-sevdesk-pluginslink-plugin)
* [`helium-miner-sevdesk plugins:uninstall PLUGIN...`](#helium-miner-sevdesk-pluginsuninstall-plugin)
* [`helium-miner-sevdesk plugins update`](#helium-miner-sevdesk-plugins-update)

## `helium-miner-sevdesk hello PERSON`

Say hello

```
USAGE
  $ helium-miner-sevdesk hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/silviokennecke/helium-miner-sevdesk/blob/v0.0.0/dist/commands/hello/index.ts)_

## `helium-miner-sevdesk hello world`

Say hello world

```
USAGE
  $ helium-miner-sevdesk hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `helium-miner-sevdesk help [COMMAND]`

Display help for helium-miner-sevdesk.

```
USAGE
  $ helium-miner-sevdesk help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for helium-miner-sevdesk.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `helium-miner-sevdesk plugins`

List installed plugins.

```
USAGE
  $ helium-miner-sevdesk plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ helium-miner-sevdesk plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `helium-miner-sevdesk plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ helium-miner-sevdesk plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ helium-miner-sevdesk plugins:inspect myplugin
```

## `helium-miner-sevdesk plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ helium-miner-sevdesk plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ helium-miner-sevdesk plugins add

EXAMPLES
  $ helium-miner-sevdesk plugins:install myplugin 

  $ helium-miner-sevdesk plugins:install https://github.com/someuser/someplugin

  $ helium-miner-sevdesk plugins:install someuser/someplugin
```

## `helium-miner-sevdesk plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ helium-miner-sevdesk plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ helium-miner-sevdesk plugins:link myplugin
```

## `helium-miner-sevdesk plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ helium-miner-sevdesk plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ helium-miner-sevdesk plugins unlink
  $ helium-miner-sevdesk plugins remove
```

## `helium-miner-sevdesk plugins update`

Update installed plugins.

```
USAGE
  $ helium-miner-sevdesk plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
