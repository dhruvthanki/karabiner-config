import { writeToProfile, rule, map, layer } from 'karabiner.ts'

const profile = 'TS-custom'

// --- Home row mods: mirrored GACS (Cmd / Opt / Ctrl / Shift), tap = letter ---
const homeRowMods = rule('Home row mods (mirrored GACS)').manipulators([
  // Left hand, pinky -> index
  map('a').to('left_command').toIfAlone('a'),
  map('s').to('left_option').toIfAlone('s'),
  map('d').to('left_control').toIfAlone('d'),
  map('f').to('left_shift').toIfAlone('f'),

  // Right hand, index -> pinky (mirrored)
  map('j').to('right_shift').toIfAlone('j'),
  map('k').to('right_control').toIfAlone('k'),
  map('l').to('right_option').toIfAlone('l'),
  map('semicolon').to('right_command').toIfAlone('semicolon'),
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

// --- Sym layer: hold Space (a real thumb key), tap = Space. Content on left hand. ---
// .delay(): Space is hit constantly mid-word, so fast typing has real rollover
// (next key goes down before Space comes up). Without delay mode that reads as
// "held", silently swallowing the space. Delay mode only arms the layer after
// a genuine pause and always passes Space through on a quick tap/rollover.
const symLayer = layer('spacebar', 'sym')
  .delay()
  .manipulators([
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

writeToProfile(profile, [homeRowMods, navLayer, symLayer, numLayer, funLayer])
