# Count compare visualization

A small web app to visualize counts or amounts.

See it live here: https://paasar.github.io/count-compare/?formula=2p5p10c2c5c10cs4cs9cs16cs100

## Formula DSL

`3 4` results in three dots and four dots side by side
`3p4` inclusion; results in three dots and one dot, the three is considered to be included in the four
`3c4` new line; results in three dots over four dots
`s4`  square/rectangle area of 4 dots

You can save or share your formulas with formula URL parameter.

https://paasar.github.io/count-compare/?formula=2p5p10c2c5c10cs4cs9cs16cs100

## TODO

   - Scale changes eg. 1 dot means 1000 units
   - Zoom eg. smaller dots
   - Inclusion between squares

## Copyright

CC BY-NC 4.0 @ Ari Paasonen
