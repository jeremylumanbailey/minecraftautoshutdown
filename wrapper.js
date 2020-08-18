'use strict';
const mcping = require('mc-ping-updated');
const {  performance } = require('perf_hooks');

console.log("\nscript started\n");

var exec = require('child_process').exec, child;
child = exec('/usr/bin/java -jar  /home/jeremy/Downloads/mctmp/server.jar nogui',
  function (error, stdout, stderr){
    // console.log('stdout: ' + stdout);
    // console.log('stderr: ' + stderr);
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

 const shutDownMachine = () => {

  console.log("Shutting down computer.")
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

function startCheckingPlayerCount() {

  var amountOfTimeWithoutPlayersOnline, tmpTime;
  var endTime, startTime = performance.now();
  var minutes = 1, the_interval = minutes * 60 * 1000;
  the_interval = 1000 // 1000 / 1 second
  var timeUntilShutdownWhenNoneOnline = 2500; //2500 = 25 seconds
  var refreshIntervalId = setInterval(function() {
    
    mcping('localhost', 25565, function(err, res) {
      if (err) {
          // Some kind of error
          console.error(err);
          
      } else {
          // Success!
          console.log(res);

          endTime = performance.now();
          amountOfTimeWithoutPlayersOnline = endTime - startTime; //in ms 
          console.log(amountOfTimeWithoutPlayersOnline);
          if(amountOfTimeWithoutPlayersOnline >= 25000 && res.players.online == 0 ) {
            writeToChildConsole("say No players detected on server. Server is shutting down.");
            console.log("No players detected on server for extendend period of time. Server is shutting down");
            writeToChildConsole('stop');
            child.stdin.end();
            rl.close();
            clearInterval(refreshIntervalId);
          }
          else if(res.players.online == 0 ) {
            if(tmpTime != startTime) {
            startTime = performance.now();
            tmpTime = startTime;
            }
          }
          else {
            tmpTime = 0;
            startTime = endTime;
          }
      }
    }, 3000);

    
  }, the_interval);
}


/* DEAD CODE DEAD CODE DEAD CODE DEAD CODE DEAD CODE DEAD CODE DEAD CODE DEAD CODE

console.log("current player count is: " + currentPlayerCount);
  console.log("and the counter is set at: " + counter);
  if(counter > 2 && currentPlayerCount === 0) {
    // writeToChildConsole("say server will be shutting down soon")
    console.log("exiting ")
    writeToChildConsole('stop');
    child.stdin.end();
    rl.close();
    clearInterval(refreshIntervalId);
  }
  if(currentPlayerCount === 0) {
    writeToChildConsole("say server will be shutting down soon")
    counter++;
  }
  
  // do your stuff here


// setTimeout(fun, 30000);

//   var exec = require('child_process').exec, childKiller, ;

//   childKiller = exec('shutdown now',
//   function (error, stdout, stderr){
//     // console.log('stdout: ' + stdout);
//     // console.log('stderr: ' + stderr);
//     console.log("server has shutdown. Turning off machine.");
//     setTimeout(fun, 30000);
//     if(error !== null){
//       console.log('exec error: ' + error);
//     }
// });

// const { spawn } = require('child_process');

// var spawn = require('child_process').spawn,
//     ls    = spawn('ls', ['-lh', '/usr']);

// ls.stdout.on('data', function (data) {
//   console.log('stdout: ' + data.toString());
// });

// ls.stderr.on('data', function (data) {
//   console.log('stderr: ' + data.toString());
// });

// ls.on('exit', function (code) {
//   console.log('child process exited with code ' + code.toString());
// });

*/