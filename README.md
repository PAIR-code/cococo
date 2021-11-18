# 𝄡 CoCoCo

#### Collaborative Convolutional Counterpoint

Bach CoCoCo is an experimental user interface to collaboratively compose counterpoint with an AI agent trained on the chorale canon of the eminent JS Bach. The repo uses a modified tensorflow.js implementation of [Coconet](https://magenta.tensorflow.org/coconet) by Huang et. al, with a soft-prior-based strategy for tuning the output of the neural network.

#### How to use

![Preview](./content/preview.gif)

For more detailed instructions, watch the [Cococo video demo](https://youtu.be/XwsWg1rsvis)

#### Running the app

CoCoCo requires node version 12 (it has been tested successfully on v12.22.7 but not on v16), and the build process requires that you run on OSX or Windows (not Linux due to an issue with case-sensitive imports in Typescript).

```bash
yarn install
yarn dev
```

**This is not an officially supported Google product**
