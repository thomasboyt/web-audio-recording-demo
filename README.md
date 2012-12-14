This is a teeny little demo for how to use [recorder.js](https://github.com/mattdiamond/Recorderjs) to record and play back audio. Recorder.js is a small convenience library for recording and playing back audio using the Web Audio API.

Currently, this demo is only confirmed to work in Google Chrome v23+ on OSX with the "Web Audio Input" flag enabled in chrome://flags. It may or may not be working on Windows or Linux, as Chrome's web audio recording support is under constant development.

Just a warning to anyone who runs this - Chrome's Web Audio input has a *lot* of annoying and potentially headache-inducing feedback if you're using a microphone and external speakers. Plug in headphones.

I originally wrote this demo walkthrough as documentation within the code, but since the code is event-driven rather than linear, it ended up being a bit messy. 

## How it works

First, the script uses getUserMedia to get a stream of the audio input (i.e. a microphone). Next, an AudioContext is created, which contains AudioNodes (which include audio sources, audio destinations, and any processing between them, such as effects). This context holds the stream source (a source node created from the stream) and the destination (i.e. your speakers).

With this set up, a new Recorder is created from the stream source.

### Recording

Recorder.js is a really simple library, and I encourage you to take a look at its two source files - the main library and the web worker that does its work.

The `Recorder` creates a new `AudioNode` in the `AudioContext` that processes and records the audio. It uses the `onaudioprocess` event each node has to record the data at a given interval, defined by the `bufferSize` parameter. Via the W3C Web Audio spec:

> The bufferSize parameter determines the buffer size in units of sample-frames. It must be one of the following values: 256, 512, 1024, 2048, 4096, 8192, 16384. This value controls how frequently the onaudioprocess event handler is called and how many sample-frames need to be processed each call. Lower values for bufferSize will result in a lower (better) latency. Higher values will be necessary to avoid audio breakup and glitches. The value chosen must carefully balance between latency and audio quality.

 You can define the buffer size yourself when creating a `Recorder` object if you'd like to override it, but by default it's 4096. 

One interesting part of the Recorder.js library is that it uses a [Web Worker](https://developer.mozilla.org/en-US/docs/DOM/Using_web_workers) to run the recording processing in a background thread. This should the performance of any web app that uses the library, as the main thread will not be tied up during any aspect of the recording process.

So, on each recording "tick," the `Recorder` object passes the channel data of the current `inputBuffer` (which is part of the audio processing event object) to the `record` function in the Worker. There are two channel data objects, which are both `Float32Array`s, one representing the left channel and one representing the right channel.

The `record` function first merges (in the `interleave` function) the two arrays together, then pushes the new array into a `recBuffers` array. This array contains all of the recorded buffers for a `Recorder`.

### Playback

The playback process of Recorder.js is almost more interesting than the recording process. After recording, the `Recorder` object now has an array of raw, recorded channel data. There are a few different ways one could take this and play back audio from it, both of which are included in the demo.

#### WAV export & audio tag

The first method of playback is easier, yet less powerful. Recorder.js includes an `exportWAV` method that creates a WAV blob from the recorded buffer. 

When the user has finished recording, [this method is called][exportWAV], returning (in a callback) the WAV blob. A [blob URL](https://developer.mozilla.org/en-US/docs/DOM/window.URL.createObjectURL) is created from this blob, allowing us to reference the blob as if it was an external file. This URL is set to be the `src` property of the `<audio>` tag on the page, and it is loaded and able to be played back by the user.

#### Web Audio Playback

While the former method allows the use of the standard `<audio>` tag with the new file, it lacks the power of using the Web Audio API to play it back. By using Web Audio, you can add all sorts of effects and processing before it is played back, combine it with other recordings, and transform your recording in whatever other ways you want. Recorder.js has a `getBuffer` method that can be used for retrieving the recorded buffer, as it is [within the demo][getBuffer].

`getBuffer` returns a pair of Float32Arrays of audio data, one for each channel (left and right). To play it back, we simply create the a new source and create left and right buffers on it using `context.createBuffer`. We set the `channelData` to be the data arrays we retrieved, connect the source to our destination, and play it back. It's not much more complex than using an `<audio>` tag, but is potentially much more powerful - we could add all sorts of processing nodes between the source and the destination, if we were so inclined.

## Resources

* [W3C Web Audio spec](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html) - If you're not used to reading these specs, they can be difficult to translate from "language for specification implimenters" to "language for web developers," but it's certainly the most comprehensive source on the matter.
* [Using web workers](https://developer.mozilla.org/en-US/docs/DOM/Using_web_workers)
* [Recorder.js](https://github.com/mattdiamond/Recorderjs)

[exportWAV]: https://github.com/thomasboyt/web-audio-recording-demo/blob/master/script/main.js#L14
[getBuffer]: https://github.com/thomasboyt/web-audio-recording-demo/blob/master/script/main.js#L22
