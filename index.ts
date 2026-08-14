import {
  writeToProfile,
  rule,
  map,
  layer,
  toKey,
  FromKeyParam,
  ToKeyParam,
} from 'karabiner.ts'
import { writeFileSync } from 'fs'

const profile = 'TS-custom'

// How long a home row mod must be held before it "arms" as a modifier.
const MOD_HOLD_MS = 200

// A rollover-safe mod-tap: hold past MOD_HOLD_MS -> modifier, tap-release
// before that -> the letter. This is Karabiner's own documented pattern for
// "letter key acts as a modifier when held" (see the official example
// "Change f key to left shift when held down" using to_if_held_down +
// to_delayed_action instead of plain to()).
//
// Plain to()+toIfAlone() (what we used before) combines with a second key
// the INSTANT it's pressed, no timing check at all — so fast rolling
// typing (e.g. "ah") can read as a modifier hold and misfire, the same
// rollover bug we already hit and fixed on Space/Return. to_if_held_down
// requires the threshold to actually elapse before it arms; if another key
// interrupts first, to_delayed_action's to_if_canceled fires the plain
// letter instead. Tradeoff: deliberate chords (e.g. Cmd+C) now need a
// genuine ~200ms hold before the modifier is live, not just a keypress.
//
// `halt: true` on toIfAlone is required: without it, a quick tap fires
// to_if_alone (sending the letter) but leaves the pending to_delayed_action
// scheduled, which then also fires later and sends the same letter again
// (doubled output). `halt` explicitly cancels any pending to_delayed_action.
function modTap(key: FromKeyParam & ToKeyParam, modifier: ToKeyParam) {
  return map(key)
    .toIfHeldDown(modifier)
    .toIfAlone(key, undefined, { halt: true })
    .toDelayedAction([], toKey(key))
    .parameters({
      'basic.to_if_held_down_threshold_milliseconds': MOD_HOLD_MS,
      'basic.to_delayed_action_delay_milliseconds': MOD_HOLD_MS,
    })
}

// --- Home row mods: Mac-tuned order, tap = letter ---
// Order is Ctrl/Opt/Shift/Cmd pinky->index (mirrored), NOT Miryoku's
// default GACS (Cmd/Opt/Ctrl/Shift) — GACS puts Cmd on the pinky, tuned for
// Windows/generic use where Ctrl dominates. On macOS Cmd is used constantly
// and Ctrl rarely, so Cmd goes on the index (strongest finger, adjacent to
// Shift for Cmd+Shift chords) and Ctrl goes on the pinky.
const homeRowMods = rule('Home row mods (Mac-tuned order)').manipulators([
  // Left hand, pinky -> index: Ctrl, Opt, Shift, Cmd
  modTap('a', 'left_control'),
  modTap('s', 'left_option'),
  modTap('d', 'left_shift'),
  modTap('f', 'left_command'),

  // Right hand, index -> pinky (mirrored): Cmd, Shift, Opt, Ctrl
  modTap('j', 'right_command'),
  modTap('k', 'right_shift'),
  modTap('l', 'right_option'),
  modTap('semicolon', 'right_control'),
])

// --- Nav layer: hold Caps Lock (left pinky), tap = Escape. Content on right hand. ---
const navLayer = layer('caps_lock', 'nav')
  .configKey((v) => v.toIfAlone('escape'), true)
  .manipulators([
    map('h').to('left_arrow'),
    map('j').to('down_arrow'),
    map('k').to('up_arrow'),
    map('l').to('right_arrow'),
    map('y').to('home'),
    map('semicolon').to('end'),
    map('u').to('page_down'),
    map('i').to('page_up'),
    map('n').to('delete_or_backspace'),
    map('m').to('delete_forward'),
  ])

// --- Sym layer: hold Space (a real thumb key), tap = Space. Content on both hands. ---
// .delay(): Space is hit constantly mid-word, so fast typing has real rollover
// (next key goes down before Space comes up). Without delay mode that reads as
// "held", silently swallowing the space. Delay mode only arms the layer after
// a genuine pause and always passes Space through on a quick tap/rollover.
const symLayer = layer('spacebar', 'sym')
  .delay()
  .manipulators([
    // Left hand
    map('q').to('1', '⇧'), // !
    map('w').to('2', '⇧'), // @
    map('e').to('3', '⇧'), // #
    map('r').to('4', '⇧'), // $
    map('t').to('5', '⇧'), // %
    map('a').to('hyphen'), // -
    map('s').to('equal_sign'), // =
    map('d').to('open_bracket'), // [
    map('f').to('close_bracket'), // ]
    map('g').to('backslash'), // backslash
    map('z').to('grave_accent_and_tilde'), // `
    map('x').to('grave_accent_and_tilde', '⇧'), // ~
    map('c').to('9', '⇧'), // (
    map('v').to('0', '⇧'), // )
    map('b').to('hyphen', '⇧'), // _

    // Right hand: shifted version of whatever's already on that physical key
    map('quote').to('quote', '⇧'), // "
    map('comma').to('comma', '⇧'), // <
    map('period').to('period', '⇧'), // >
    map('slash').to('slash', '⇧'), // ?
    map('semicolon').to('semicolon', '⇧'), // :
    map('h').to('backslash', '⇧'), // |
    map('y').to('7', '⇧'), // &
    map('u').to('8', '⇧'), // *
    map('n').to('equal_sign', '⇧'), // +
  ])

// --- Num layer: hold Return (right pinky, mirrors Caps Lock), tap = Enter. Content on left hand. ---
// Same rollover problem as Space (Enter fires right after typing a line fast), same fix.
const numLayer = layer('return_or_enter', 'num')
  .delay()
  .manipulators([
    map('q').to('7'),
    map('w').to('8'),
    map('e').to('9'),
    map('a').to('4'),
    map('s').to('5'),
    map('d').to('6'),
    map('z').to('1'),
    map('x').to('2'),
    map('c').to('3'),
    map('v').to('0'),
  ])

// --- Fun layer: hold Tab (left pinky), tap = Tab. F-keys on number row, media on right hand. ---
const funLayer = layer('tab', 'fun')
  .configKey((v) => v.toIfAlone('tab'), true)
  .manipulators([
    map('1').to('f1'),
    map('2').to('f2'),
    map('3').to('f3'),
    map('4').to('f4'),
    map('5').to('f5'),
    map('6').to('f6'),
    map('7').to('f7'),
    map('8').to('f8'),
    map('9').to('f9'),
    map('0').to('f10'),
    map('h').toConsumerKey('display_brightness_decrement'),
    map('l').toConsumerKey('display_brightness_increment'),
    map('j').toConsumerKey('volume_decrement'),
    map('k').toConsumerKey('volume_increment'),
    map('semicolon').toConsumerKey('mute'),
    map('n').toConsumerKey('play_or_pause'),
    map('comma').toConsumerKey('rewind'),
    map('period').toConsumerKey('fast_forward'),
  ])

// Rule order matters: Karabiner applies the FIRST matching manipulator in
// document order and ignores the rest, with no special treatment for
// conditioned vs unconditioned ones. Layer rules (conditioned on their
// variable) must come before the unconditioned home row mods rule, or the
// home row mods would always win on every key they share (a/s/d/f, j/k/l/;)
// and the layers' own remaps of those keys would never fire.
const rules = [navLayer, symLayer, numLayer, funLayer, homeRowMods]
const parameters = { 'basic.to_if_alone_timeout_milliseconds': 250 }

writeToProfile(profile, rules, parameters)

// Save a copy of what actually got generated, tracked in git as a
// reference — not the source of truth (index.ts is), just a readable
// snapshot of its output. Built directly from the same rule objects passed
// to writeToProfile above, NOT by reading karabiner.json back — that file
// is also watched/rewritten by Karabiner-Elements' own background process,
// and reading it back immediately after our own write raced that process
// and corrupted the live config (twice). Serializing our own in-memory
// objects instead avoids touching that file a second time.
writeFileSync(
  'karabiner.generated.json',
  JSON.stringify({ rules: rules.map((r) => r.build()), parameters }, null, 2) +
    '\n',
)
