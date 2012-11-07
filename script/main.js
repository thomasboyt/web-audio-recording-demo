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
    }.bind(this))
  }

  navigator.webkitGetUserMedia({"audio": true}, function(stream) {

    $("#shown").toggle();
    $("#hidden").toggle();

    var audioContext = new webkitAudioContext();
    var mediaStreamSource = audioContext.createMediaStreamSource( stream );
    mediaStreamSource.connect( audioContext.destination );

    var recorder = new Recorder(mediaStreamSource);
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

  }, 

  function(error) {
    $("body").text("Error: you need to allow this sample to use the microphone.")
  });
})