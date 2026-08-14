# karabiner-config

Personal macOS keyboard config, written in TypeScript with
[karabiner.ts](https://github.com/evan-liu/karabiner.ts) and compiled into
Karabiner-Elements' `complex_modifications` rules. Built to bring home row
mods and layers from a 40% split ortholinear keyboard onto a normal
system-wide keyboard.

Applies to the **`TS-custom`** profile in Karabiner-Elements (Settings →
Profiles), so the Default profile is left untouched.

## Setup

```
npm install
npm run apply   # writes rules into ~/.config/karabiner/karabiner.json
```

Then switch to the `TS-custom` profile in Karabiner-Elements' menu bar icon
or Settings → Profiles. Edits hot-reload — no need to restart Karabiner
after `npm run apply`.

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
alone still sends its normal key. Space and Return use karabiner.ts's
`.delay()` mode, since both are hit constantly mid-word/mid-line — without
it, fast typing rollover reads as "held" and silently swallows the
space/enter.

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
| Sends | F1-F10 | Brightness − | Brightness + | Volume − | Volume + | Mute | Play/Pause | Rewind | Fast-forward |

## Design notes

- **Rule order matters.** Karabiner applies only the first matching
  manipulator in document order, with no special priority for conditioned
  vs. unconditioned ones. The four layers are listed before the home row
  mods rule in `index.ts` — if home row mods came first, its unconditioned
  mappings on `a s d f` / `j k l ;` would always win, and the Sym/Num/Nav
  content on those same keys would never fire.
- **Physical modifier keys (Right Option/Command) can't be layer
  triggers** — karabiner.ts's `layer()` rejects raw modifier key codes at
  runtime. Space and Return were used instead (thumb key + pinky mirror of
  Caps Lock).
- `basic.to_if_alone_timeout_milliseconds` is set to `250` profile-wide
  instead of relying on Karabiner's default.
