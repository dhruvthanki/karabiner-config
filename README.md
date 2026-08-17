# karabiner-config

Personal keyboard config, now written for [kanata](https://github.com/jtroo/kanata)
instead of Karabiner-Elements. Built to bring home row mods and layers from a
40% split ortholinear keyboard onto a normal system-wide keyboard — and to
run identically on both a MacBook and a Lenovo laptop on CachyOS/niri, since
kanata (unlike Karabiner-Elements) works on both macOS and Linux.

`kanata.kbd` is the single source of truth: one plain file, byte-identical on
both machines. Nothing in the actual remap logic differs between macOS and
Linux for this config — every construct and key name used here is portable —
so all OS-specific work lives in the surrounding *service* setup (driver/
permissions/daemon on macOS vs uinput/udev/systemd on Linux), never in the
config file itself.

This repo previously generated a Karabiner-Elements `TS-custom` profile from
a TypeScript file using the [karabiner.ts](https://github.com/evan-liu/karabiner.ts)
library. See git history (before the kanata port) for that version, and
[Rollback](#rollback) below if you ever need to resurrect it.

## Home row mods

Hold for a modifier, tap for the letter. Mirrored across both hands, and
ordered for macOS specifically (Cmd is used constantly, Ctrl rarely — so
Cmd sits on the index finger, not the pinky like the common GACS default):

| Finger | Left | Mod | Right | Mod |
|---|---|---|---|---|
| Pinky  | A | Ctrl  | ; | Ctrl  |
| Ring   | S | Opt   | L | Opt   |
| Middle | D | Shift | K | Shift |
| Index  | F | Cmd   | J | Cmd   |

## Layers

Each layer activates by holding its trigger key; tapping the trigger key
alone still sends its normal key.

### Nav — hold Caps Lock (tap = Escape)

Content on the right hand:

| Key | h | j | k | l | y | ; | u | i | n | m |
|---|---|---|---|---|---|---|---|---|---|---|
| Sends | ← | ↓ | ↑ | → | Home | End | Page Down | Page Up | Backspace | Delete |

### Sym — hold Space (tap = Space)

Left hand:

| Key | q | w | e | r | t | a | s | d | f | g | z | x | c | v | b |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sends | ! | @ | # | $ | % | - | = | [ | ] | \ | \` | ~ | ( | ) | _ |

Right hand (shifted form of whatever's already on that physical key):

| Key | ' | , | . | / | ; | h | y | u | n |
|---|---|---|---|---|---|---|---|---|---|
| Sends | " | < | > | ? | : | \| | & | * | + |

### Num — hold Return (tap = Enter)

Numpad-shaped block on the left hand:

| | Left | Middle | Right |
|---|---|---|---|
| Row 1 | Q → 7 | W → 8 | E → 9 |
| Row 2 | A → 4 | S → 5 | D → 6 |
| Row 3 | Z → 1 | X → 2 | C → 3 |
| | | V → 0 | |

### Fun — hold Tab (tap = Tab)

Number row becomes F-keys, right hand becomes media controls:

| Key | 1-0 | h | l | j | k | ; | n | , | . |
|---|---|---|---|---|---|---|---|---|---|
| Sends | F1-F10 | Brightness − | Brightness + | Volume − | Volume + | Mute | Play/Pause | Previous track | Next track |

## Setup — macOS

1. Install kanata **from `main`, not the stable formula**:
   ```
   brew install --HEAD kanata
   ```
   (If a stable `kanata` is already installed: `brew unlink kanata` first.)
   Why: kanata's macOS backend talks to Karabiner's
   `Karabiner-DriverKit-VirtualHIDDevice` driver over a versioned protocol.
   Karabiner-Elements 16.1.0+ bundles driver **v8.0.0** (protocol 7), but
   the current stable kanata release (1.12.0) only speaks the older
   protocol 5 (driver v6.2.0) — connecting fails with a repeating
   `connect_failed asio.system:2` in the logs. `main` already depends on
   `karabiner-driverkit v0.4.0`, the protocol-7 client that matches.
   Re-check this once kanata ships a stable v1.13.0+ release — the docs'
   own driver-compatibility table (`docs/setup-macos.md`) says v1.13.0 is
   the first stable line to require v8.0.0, so a plain `brew install kanata`
   should work again then.
2. Copy this repo's `kanata.kbd` to `~/.config/kanata/kanata.kbd`.
3. Validate before touching anything else (pure syntax check, no input
   grab, zero lockout risk): `kanata --cfg ~/.config/kanata/kanata.kbd --check`.
4. Confirm the device filter matches your hardware. `kanata.kbd`'s `defcfg`
   hardcodes `macos-dev-names-include ("Apple Internal Keyboard / Trackpad")`
   — without this, kanata grabs *every* enumerated keyboard, including its
   own virtual output device (and Karabiner's separate virtual keyboard),
   which feeds output back in as input and makes a held key repeat forever.
   Run `kanata --list` to see your exact device names if you're on
   different hardware (e.g. an external keyboard) and adjust the list.
5. Grant permissions: `sudo kanata --macos-request-permissions`. In practice
   this reported "trusted" immediately when run from Terminal — a root
   process launched from an already-trusted terminal commonly doesn't need
   a separate visible entry in System Settings → Privacy & Security. If
   remapping doesn't work at all once running, check Input Monitoring /
   Accessibility there as a first troubleshooting step.
6. **Stop Karabiner-Elements' low-level grab** — this is the step that
   actually matters, more than which profile is selected. Karabiner-Elements
   grabs the physical keyboard exclusively via a background LaunchDaemon
   (`Karabiner-Core-Service`) regardless of which profile is active or
   whether the GUI app is even running — quitting the app via its menu bar
   does *not* stop this daemon. Confirmed via `--debug`: without stopping
   it, kanata logs `IOHIDDeviceOpen error: ... exclusive access and device
   already open` and behaves erratically (tap-hold resolves incorrectly).
   Stop it with:
   ```
   sudo launchctl bootout system/org.pqrs.service.daemon.Karabiner-Core-Service
   ```
   This is reversible — relaunching Karabiner-Elements.app re-bootstraps it,
   as does a reboot. Also switch the active profile from `TS-custom` to
   `Default` (Settings → Profiles, or `karabiner_cli --select-profile
   "Default profile"`) so that if Core-Service does restart later (e.g.
   after a reboot, before you've run this command again), it isn't
   reapplying `TS-custom`'s rules. Don't delete `TS-custom` or its rules —
   it's the rollback path.
7. **Before running kanata for real**, enable Remote Login (System Settings
   → General → Sharing) as an SSH escape hatch — this config remaps Space,
   Tab, Return, and Caps Lock, so a broken config could make typing
   unusable system-wide.
8. Foreground supervised test run, terminal kept in focus (Ctrl+C = instant
   kill switch): `sudo kanata --cfg ~/.config/kanata/kanata.kbd --no-wait`.
   Exercise tap-alone behavior, normal-speed typing (watch for misfired
   home row mods), a deliberate hold-and-chord (e.g. Cmd+C), and every
   layer's content including media keys. If something seems off, rerun with
   `--debug` — the `key press`/`key release` lines show exactly what each
   physical key resolved to, which is far more reliable than judging from
   visible output alone. Note: `sudo` on this Mac allocates a separate
   pseudo-tty for the actual command, so `ps aux | grep kanata` showing two
   process rows for one `sudo kanata ...` invocation is normal, not a
   duplicate instance — don't chase that as a bug.
9. Only once confident, promote to a persistent service:
   `sudo brew services start kanata` (the formula's service block already
   sets `require_root`, `keep_alive`, and logs to `var/log/kanata.log`).
   `macos/dev.kanata.kanata.plist` in this repo is a reference LaunchDaemon
   plist, kept only as a documented fallback if ever installing outside
   Homebrew.

## Setup — CachyOS / Linux (niri)

**Confirmed working** on a Lenovo laptop running CachyOS/niri — home row
mods, all four hold-layers, and the Fun layer's media keys (via niri's
existing `noctalia msg` binds) all check out.

1. `paru -S kanata-bin` (or `kanata-git`).
2. `sudo groupadd --system uinput` (must be `--system`/`-r` — a systemd
   ≥258 regression breaks non-system uinput groups), then
   `sudo usermod -aG input,uinput $USER`, `sudo modprobe uinput` (and add
   `uinput` to `/etc/modules-load.d/uinput.conf` for boot persistence).
3. Install `linux/99-input.rules` to `/etc/udev/rules.d/`, then
   `sudo udevadm control --reload-rules && sudo udevadm trigger`.
4. Log out/in (or `newgrp uinput`) for group membership to take effect.
   **A plain niri logout/login may not be enough**: if your `systemd --user`
   manager survives the relogin (it isn't always torn down just because the
   graphical session restarted), processes it spawns keep the old
   supplementary-group list and `/dev/uinput` stays permission-denied even
   though `id $USER` shows the new groups system-wide. Confirmed via
   `ps -o pid,cmd -p $(pgrep alacritty)` and `/proc/<pid>/status` showing
   the terminal's `Groups:` line missing `uinput`/`input` right after a
   niri relogin. A full reboot is the reliable fix.
5. Copy this repo's `kanata.kbd` to `~/.config/kanata/kanata.kbd` — no
   edits needed, it's the same file used on macOS.
6. Validate: `kanata --cfg ~/.config/kanata/kanata.kbd --check`.
7. Foreground supervised test run first, same reasoning as the macOS setup
   (Ctrl+C kill switch, terminal kept in focus):
   `kanata --cfg ~/.config/kanata/kanata.kbd --no-wait`.
8. Only once confident, install `linux/kanata.service` to
   `~/.config/systemd/user/kanata.service`, then stop the foreground
   instance and hand off to the service: `systemctl --user daemon-reload &&
   systemctl --user enable --now kanata`.

### niri media keys

kanata emits standard consumer keycodes for volume/brightness/play-pause/
track-skip, but niri is a minimal compositor with no shell of its own — it
won't act on those keycodes without an explicit keybind. Add binds to
`~/.config/niri/config.kdl` calling `wpctl`, `brightnessctl`, and
`playerctl`, e.g.:

```kdl
binds {
    XF86AudioRaiseVolume  { spawn "wpctl" "set-volume" "@DEFAULT_AUDIO_SINK@" "5%+"; }
    XF86AudioLowerVolume  { spawn "wpctl" "set-volume" "@DEFAULT_AUDIO_SINK@" "5%-"; }
    XF86AudioMute         { spawn "wpctl" "set-volume" "@DEFAULT_AUDIO_SINK@" "toggle"; }
    XF86MonBrightnessUp   { spawn "brightnessctl" "set" "5%+"; }
    XF86MonBrightnessDown { spawn "brightnessctl" "set" "5%-"; }
    XF86AudioPlay         { spawn "playerctl" "play-pause"; }
}
```

Confirm the exact bind-name spellings on-device — they depend on niri's
keymap/xkb layer, not just on what kanata emits.

## Design notes

- **Plain `tap-hold`, not `tap-hold-except-keys`, for home row mods and
  Space/Return.** An earlier draft used `tap-hold-except-keys` with every
  key listed as an interrupt, aiming to match the original's "any other
  key cancels to a tap" rollover guard. That backfired: the tap-keys list
  forces an instant tap the moment *any* listed key is pressed, regardless
  of how long the mod key was already held — and since the list held every
  key (needed for rollover safety), it also broke every same-hand
  modifier+letter chord (Cmd+C, Cmd+V, etc. — Cmd lives on `f`, same hand
  as `c`/`v`), and broke Space/Return's own layers, since reaching any
  layer key requires pressing "another key" too. Confirmed empirically via
  `--debug`: holding `f` for 2.5 real seconds then pressing `c` still
  resolved as a tap under `tap-hold-except-keys`; switching to plain
  `tap-hold` (no keys list at all — matching kanata's own
  `cfg_samples/home-row-mod-basic.kbd`) fixed it immediately. Caps Lock and
  Tab still use `tap-hold-press` (the layer goes live the instant another
  key is *pressed*, no rollover guard at all) — matching the original
  config's pre-existing, deliberate lack of a rollover guard on those two
  keys specifically.
- **Timing**: home row mods and Space/Return use a 200ms threshold; Caps/Tab
  use 250ms. These numbers come from tracing the exact defaults the old
  karabiner.ts config resolved to (its own library default for delay-mode
  layers, and the profile-wide alone-timeout for the non-delay ones) — not
  arbitrary choices. Tune the `defvar` block in `kanata.kbd` if any of these
  feel too slow or too trigger-happy.
- **Layer fallthrough via `_`**: each overlay layer (`nav`/`sym`/`num`/`fun`)
  only overrides the exact keys its karabiner.ts equivalent claimed;
  everything else is `_` (transparent), falling through to `base` — which is
  what keeps home row mods live on the keys a given layer doesn't touch
  (e.g. left-hand home row mods still work while the Nav layer, right-hand
  only, is held).
- **One shared file, no per-OS forking.** All remap logic and key names used
  here are portable across kanata's macOS and Linux builds — the only things
  that differ between machines are the surrounding service/permission setup
  (see the two Setup sections above), never `kanata.kbd` itself.
- **Two macOS-only gotchas that aren't about the config's remap logic**, both
  found by running with `--debug` rather than guessing from behavior alone:
  (1) kanata's driver-protocol version must match Karabiner-Elements'
  bundled driver, which required building from `main` instead of the
  stable release (see Setup step 1); (2) Karabiner-Elements' own background
  `Core-Service` daemon holds an exclusive grab on the physical keyboard
  independent of which profile is active, and must be stopped explicitly
  (see Setup step 6) — switching profiles alone does nothing to release it.

## Rollback

- **macOS**: Karabiner-Elements' `TS-custom` profile and its rules are never
  deleted during the cutover, only deselected — reactivate it any time via
  the Karabiner-Elements menu bar icon → Profiles, no git involved.
- **Full revert to the old karabiner.ts pipeline**: check out `index.ts`,
  `karabiner.generated.json`, `package.json`, and `package-lock.json` from
  the commit before the kanata port, then `npm install && npm run apply`.
- **Linux**: no prior state to roll back to (first-time setup) —
  `systemctl --user disable --now kanata` to stop.
