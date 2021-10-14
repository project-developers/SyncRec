 //Registering Service Worker
//if ('serviceWorker' in navigator) {
  //navigator.serviceWorker.register('/rec/sw.js');
//}


/*

navigator.permissions.query({name:'microphone'}).then(function(result) {
  if (result.state == 'granted') {

  } else if (result.state == 'prompt') {

  } else if (result.state == 'denied') {

  }
  result.onchange = function() {

  };
});
*/
var clearAll = document.getElementById('clearAll');
var myMeterElement = document.getElementById('my-peak-meter');
var unloadButton = document.getElementById('unload');
//var reset = document.getElementById('reset');

unloadButton.addEventListener("click", unload);
clearAll.addEventListener("click", cleanup);
/*reset.addEventListener("click", reload);

function reload() {
	location.reload();
}
*/
function cleanup() {
	document.getElementById('recordingsList').innerHTML="";
	clearAll.innerHTML="";
}

function unload(){

unloadButton.disable = true;
removeReference();
};

function removeReference(){

//clearAll = "a";
//document.getElementById('recordingsList').innerHTML="";

var player = document.getElementById('movie');

//player.remove();
player.removeAttribute('src'); // empty source
player.load();
//document.getElementById('show').innerHTML= "";
//document.getElementById('referenceList').innerHTML= "";
document.getElementById('video-upload').value="";


};

function play(){
   //document.getElementById('show').innerHTML='<video id="movie" style="width: 100%;" ></video>';
   var player = document.getElementById('movie');
   player.load();

player.src = fileLocation;
player.controls = "true";
player.setAttribute("playsinline",null);

player.addEventListener("load", () => {
   URL.revokeObjectURL(urlObj);
 });

};
 
var fileLocation;
 
function changeHandler({
 target
}) {
 // Make sure we have files to use
 if (!target.files.length) return;
 
 // Create a blob that we can use as an src for our audio element
 const urlObj = URL.createObjectURL(target.files[0]);
fileLocation = urlObj;
 // Create an audio elements
play();

//unloadButton.disable = false;

//clearAll = "b";


};
 
document
 .getElementById("video-upload")
 .addEventListener("change", changeHandler);

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input;                                             //MediaStreamAudioSourceNode we'll be recording
var meterNode;
var webAudioPeakMeter; 	                               //webAudioPeakMeter object

var recorder; 						//MediaRecorder object
var chunks = [];					//Array of chunks of audio data from the browser
var extension;

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");
var monitorButton = document.getElementById("monitorButton");
var gainSet = document.getElementById("gain");
var output = document.getElementById("gainValue");
var dot = document.getElementById("dot");

output.innerHTML = " ["+gainSet.value/100+"0] "; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
gainSet.oninput = function() {
  if(this.value==100){
		output.innerHTML = " [1.00] ";
	}else if(this.value==0){
		output.innerHTML = " [0.00] ";
	}else if(this.value==10 || this.value==20 || this.value==30 || this.value==40 || this.value==50 || this.value==60 || this.value==70 || this.value==80 || this.value==90){
		output.innerHTML = " ["+this.value/100+"0] ";
	}else{
	output.innerHTML = " ["+this.value/100+"] ";
	}
}

function adjustGain(){
if(monitorButton.innerHTML=="Stop Monitoring"){
	//set gain
	recGain = Number(gainSet.value/100);
	
	var constraints = {
    audio: {
        sampleRate: 48000,
        channelCount: 1,
        volume: recGain,
	echoCancellation: true,
	noiseSuppression: false,
	autoGainControl: false
	    
    },
    video: false
}
	gumStream.getAudioTracks()[0].stop();
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
 audioContext = new AudioContext();
//assign to gumStream for later use
	gumStream = stream;
		
		/* use the stream */
	input = audioContext.createMediaStreamSource(stream);
	//input.gain.defaultValue = recGain;
//input.gain.value = recGain;
	meterNode = webAudioPeakMeter.createMeterNode(input, audioContext);
	myMeterElement.innerHTML = '';
  webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
}).catch(function(err) {
    /* handle the error */
});

}
	
}

function monitor() {
	if(monitorButton.innerHTML!=="Stop Monitoring"){
	//stopButton.style.display = "none";
	//pauseButton.style.display = "none";
	recordButton.style.display = "none";
	//recordButton.disabled = true;
	monitorButton.innerHTML="Stop Monitoring";
	//set gain
	recGain = Number(gainSet.value/100);
	
	var constraints = {
    audio: {
        sampleRate: 48000,
        channelCount: 1,
        volume: recGain,
	echoCancellation: true,
	noiseSuppression: false,
	autoGainControl: false
	    
    },
    video: false
}
	//gumStream.getAudioTracks()[0].stop();
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
	
audioContext = new AudioContext();

gumStream = stream;

	input = audioContext.createMediaStreamSource(stream);
	meterNode = webAudioPeakMeter.createMeterNode(input, audioContext);
	
	//myMeterElement.innerHTML = "";
	webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
	
	});
		
	
	}else{
	
	recordButton.style.display = "block";
	monitorButton.innerHTML="Monitor";
	//recordButton.disabled = false;
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	myMeterElement.innerHTML = '';
	}
	
}

//add events to those 2 buttons
recordButton.addEventListener("click", startRec);
monitorButton.addEventListener("click", monitor);
gainSet.addEventListener("change", adjustGain);
stopButton.addEventListener("click", stopRec);
pauseButton.addEventListener("click", pauseRec);

/*
// true on chrome, false on firefox
console.log("audio/webm:"+MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
// false on chrome, true on firefox
console.log("audio/ogg:"+MediaRecorder.isTypeSupported('audio/ogg;codecs=opus'));

if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')){
	extension="webm";
}else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')){
	extension="ogg";
}else{*/
	extension="wav";

function startRec() {
	console.log("recordButton clicked");
	
	recGain = Number(gainSet.value/100);

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { 
	    audio: {
	volume: recGain,
	echoCancellation: false,
	autoGainControl: false
	    
    },
    video: false
}
	
	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new MediaRecorder(stream);
		
		rec.ondataavailable = function(e) {
		createDownloadLink(e.data)
		};
		//start the recording process
		rec.start();
		
	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	stopButton.style.display = "block";
	pauseButton.style.display = "block";
	monitorButton.style.display = "none";
	recordButton.style.display = "none";
	

		
		meterNode = webAudioPeakMeter.createMeterNode(input, audioContext);
		//myMeterElement.innerHTML = '';
		webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
		dot.style.background = "red";

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
	recordButton.style.display = "block";
	monitorButton.style.display = "block";
	stopButton.style.display = "none";
	pauseButton.style.display = "none";
	});
}

function pauseRec(){
	console.log("pauseButton clicked rec.state=",rec.state );
	if (rec.state == 'recording'){
		//pause
		rec.pause();
		pauseButton.innerHTML="Resume";
		dot.style.background = "#000000";
	}else{
		//resume
		rec.resume()
		pauseButton.innerHTML="Pause";
		dot.style.background = "red";

	}
}

function stopRec() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.style.display = "none";
	pauseButton.style.display = "none";
	recordButton.style.display = "block";
	monitorButton.style.display = "block";

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();
	myMeterElement.innerHTML = '';
	dot.style.background = "#000000";

	if(clearAll.innerHTML==""){clearAll.innerHTML="Clear All";};

	
}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('div');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();
	filename = filename.slice(5, -8);

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	//if(extension=="webm"){extension="wav"};
	link.href = url;
	link.download = filename+"."+extension; //download forces the browser to download the file using the filename
	link.innerHTML = "Save";

	//add the new audio element to li
	li.appendChild(au);
	
	//add the filename to the li
	li.appendChild(document.createTextNode(filename+"."+extension))
	li.appendChild(document.createTextNode (" "))//add a space in between

	//add the save to disk link to li
	li.appendChild(link);
	
	//add the li element to the ol
	recordingsList.prepend(li);
}

