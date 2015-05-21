ep4js is a GA/EP framework written in JavaScript.

It is intended to run in any JS interpreter, including (primarily) web browsers.

ep4js at its core consists simply of an evolver class, `EP` that provides callback hooks to perform crossover, mutation and evaluation on individual programs that you specify.

The hard part isn't writing `EP`, it's encoding your problem as a set of programs with crossover and mutation operators.

The `EP` itself very basic, parameterized by:
  * population size
  * mutation rate
  * elitism count
  * whether you are maximizing or minimizing
  * number of generations to run