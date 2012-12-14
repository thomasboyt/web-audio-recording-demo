$(function () {

  var startRecorder = function(recorder) {
    recorder.clear();
    recorder.record();

    $("a#record-toggle").text("Click to stop recording...");
  }

  var stopRecorder = function(recorder) {
    recorder.stop();
    $("a#record-toggle").text("Click me to re-record.");

    recorder.exportWAV(function(wav) {
      var url = window.webkitURL.createObjectURL(wav);
      $("audio#recorded-audio").attr("src", url);
      $("audio#recorded-audio").get()[0].load();
    });
  }

  var playbackRecorderAudio = function (recorder, context) {
    recorder.getBuffer(function (buffers) {
      var source = context.createBufferSource();
      source.buffer = context.createBuffer(1, buffers[0].length, 44100);
      source.buffer.getChannelData(0).set(buffers[0]);
      source.buffer.getChannelData(0).set(buffers[1]);
      source.connect(context.destination);
      source.noteOn(0);
    });
  }

  navigator.webkitGetUserMedia({"audio": true}, function(stream) {

    $("#shown").toggle();
    $("#hidden").toggle();

    var audioContext = new webkitAudioContext();
    var mediaStreamSource = audioContext.createMediaStreamSource( stream );
    mediaStreamSource.connect( audioContext.destination );

    var recorder = new Recorder(mediaStreamSource, {
      workerPath: "/script/lib/recorderjs/recorderWorker.js"
    });
    var recording = false;

    $("a#record-toggle").click(function (e) {

      e.preventDefault();
      if (recording === false) {
        startRecorder(recorder);
        recording = true;
      }
      else {
        stopRecorder(recorder);
        recording = false;
      }

    });

    $("a#webaudio-playback").click(function (e) {
      e.preventDefault();
      playbackRecorderAudio(recorder, audioContext);
    })

  }, 

  function(error) {
    $("body").text("Error: you need to allow this sample to use the microphone.")
  });
})