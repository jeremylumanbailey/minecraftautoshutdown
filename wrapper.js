'use strict';
const mcping = require('mc-ping-updated');
const {  performance } = require('perf_hooks');

console.log("\nscript started\n");

var exec = require('child_process').exec;
var child = exec('/usr/bin/java -jar /home/ec2-user/endtimespart2/mcserver/server.jar nogui', function (error, stdout, stderr){
  // console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  shutDownMachine();
  if(error !== null){
    console.log('exec error: ' + error);
  }
});

child.stdin.setEncoding('utf-8');
// child.stdout.pipe(process.stdout);


// Pipes stdout of Java process to nodejs
child.stdout.on('data', function(data) {
  console.log('stdout: ' +  data.toString());

});

function writeToChildConsole(str) {

    child.stdin.write(str+"\n");

}

 function shutDownMachine() {

  console.log("Shutting down computer.");


   var killer = exec('sudo shutdown now', function (error, stdout, stderr){
	  console.log('stdout: ' + stdout);
  if(error !== null){
    console.log('exec error: ' + error);
  }
	});




  exit();


}



const readline = require("readline");
const { exit } = require('process');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



var recursiveAsyncReadLine = function () {
  rl.question('', function (answer) {
    if (answer == 'stop') { //we need some base case, for recursion
      writeToChildConsole('stop');
      child.stdin.end(); /// this call seems necessary, at least with plain node.js executable 
      return rl.close();
    } //closing RL and returning from function.
    writeToChildConsole(answer);
    console.log('Got it! Your answer was: "', answer, '"');
    recursiveAsyncReadLine(); //Calling this function again to ask new question. 
    // Should be tail recursive since it registers a callback and then ends the previous one
    // Thus preventing stackover flow error 
  });
};


// TODO add a pause here so the server has time to startup before trying to write to it

recursiveAsyncReadLine(); //we have to actually start our recursion somehow

/*
  This is used to set the amount of time for the server to run automatically before it starts checking if it should shut down. 
  the amountOfTimeBeforeCheckingPlayerCount is in ms i.e 3000 = 3 seconds.
*/
let amountOfTimeBeforeCheckingPlayerCount = 30000;
setTimeout(startCheckingPlayerCount, amountOfTimeBeforeCheckingPlayerCount);

function checkIfPlayersOnline(err, res) {
  if (err) {
      // Some kind of error
      console.error(err);
  } else {
    // Success!
    console.log(res);

    this.endTime = performance.now();
    this.amountOfTimeWithoutPlayersOnline = this.endTime - this.startTime; //in ms 
    console.log(this.amountOfTimeWithoutPlayersOnline);
    if (this.amountOfTimeWithoutPlayersOnline >= 3240000 && res.players.online == 0) {
      writeToChildConsole("say No players detected on server. Server is shutting down.");
      console.log("No players detected on server for extendend period of time. Server is shutting down");
      writeToChildConsole('stop');
      child.stdin.end();
      rl.close();
     //  clearInterval(refreshIntervalId);
    }
    else if (res.players.online == 0) {
      if(this.tmpTime != this.startTime) {
        this.startTime = performance.now();
        this.tmpTime = this.startTime;
      }
    }
    else {
      this.tmpTime = 0;
      this.startTime = this.endTime;
    }
  }
}

function startCheckingPlayerCount() {
  this.startTime = performance.now();
  this.amountOfTimeWithoutPlayersOnline = 0;
  this.tmpTime = 0;
  var minutes = 1
  this.timeUntilShutdownWhenNoneOnline = 2500; //2500 = 25 seconds
  var the_interval = minutes * 60 * 1000;
  the_interval = 1000 // 1000 / 1 second
  setInterval(() => {
    mcping('localhost', 25565, checkIfPlayersOnline.bind(this), 3000);  
  }, the_interval);
}

