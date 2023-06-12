document.addEventListener("DOMContentLoaded", function() {
  const countdownTimer = document.getElementById("countdown-timer");
  const currentTimeDisplay = document.getElementById("current-time");
  const initialTimeDisplay = document.getElementById("initial-time");
  const latestTimeDisplay = document.getElementById("latest-time");
  const controls = document.getElementById("controls");

  function formatDate(date) {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
  }

  function readTextFile(file, callback) {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status === 200) {
        if (callback) callback(rawFile.responseText);
      }
    };
    rawFile.send(null);
  }

  function writeTextFile(file, content, callback) {
    const rawFile = new XMLHttpRequest();
    rawFile.open("POST", file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status === 200) {
        if (callback) callback();
      }
    };
    rawFile.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    rawFile.send("content=" + encodeURIComponent(content));
  }

  function deleteTextFile(file, callback) {
    const rawFile = new XMLHttpRequest();
    rawFile.open("DELETE", file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status === 200) {
        if (callback) callback();
      }
    };
    rawFile.send(null);
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateCountdownTime(countdownTime) {
    countdownTimer.textContent = countdownTime;
  }

  function showReleaseMessage() {
    countdownTimer.style.display = "none";
    controls.innerHTML = '<p class="congrats">Congratulations! You are Free!</p><button class="start-again">Start Again!</button>';
    const startAgainButton = document.querySelector(".start-again");
    startAgainButton.addEventListener("click", function() {
      deleteTextFile("min.txt", function() {
        deleteTextFile("max.txt", function() {
          deleteTextFile("cur.txt", function() {
            location.reload();
          });
        });
      });
    });
  }

  function startCountdown(releaseTime) {
    const countdownInterval = setInterval(function() {
      const currentTime = new Date().getTime();
      const timeRemaining = releaseTime - currentTime;
      if (timeRemaining <= 0) {
        clearInterval(countdownInterval);
        showReleaseMessage();
      } else {
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        const countdownTime = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
        updateCountdownTime(countdownTime);
      }
    }, 1000);
  }

  function initializeCountdown() {
    // Read the contents of 'cur.txt'
    readTextFile("cur.txt", function(curContent) {
      const curTime = parseInt(curContent);
      const currentTime = new Date().getTime();

      // Check if 'cur.txt' is empty or the current time is past the release time
      if (isNaN(curTime) || curTime <= currentTime) {
        // Read the contents of 'min.txt' and 'max.txt'
        readTextFile("min.txt", function(minContent) {
          readTextFile("max.txt", function(maxContent) {
            const minTime = parseInt(minContent);
            const maxTime = parseInt(maxContent);

            // Show the input fields and "BEGIN" button
            const minInput = document.createElement("input");
            minInput.type = "number";
            minInput.placeholder = "Minimum hours";
            minInput.addEventListener("input", function() {
              this.value = this.value.replace(/\D/g, "").slice(0, 3); // Only allow numbers and limit to 3 digits
            });

            const maxInput = document.createElement("input");
            maxInput.type = "number";
            maxInput.placeholder = "Maximum hours";
            maxInput.addEventListener("input", function() {
              this.value = this.value.replace(/\D/g, "").slice(0, 3); // Only allow numbers and limit to 3 digits
            });

            const beginButton = document.createElement("button");
            beginButton.textContent = "BEGIN";
            beginButton.addEventListener("click", function() {
              const minHours = parseInt(minInput.value);
              const maxHours = parseInt(maxInput.value);

              // Validate the input values
              if (isNaN(minHours) || isNaN(maxHours) || minHours <= 0 || maxHours <= 0 || minHours === maxHours) {
                alert("Invalid input. Please enter valid values for the minimum and maximum hours.");
              } else {
                const minReleaseTime = currentTime + minHours * 60 * 60 * 1000;
                const maxReleaseTime = currentTime + maxHours * 60 * 60 * 1000;

                // Write the release time to 'min.txt' and 'cur.txt'
                writeTextFile("min.txt", minReleaseTime, function() {
                  writeTextFile("cur.txt", minReleaseTime, function() {
                    location.reload();
                  });
                });

                // Write the release time to 'max.txt'
                writeTextFile("max.txt", maxReleaseTime, function() {
                  location.reload();
                });
              }
            });

            controls.appendChild(minInput);
            controls.appendChild(maxInput);
            controls.appendChild(beginButton);
          });
        });
      } else {
        // 'cur.txt' is not empty and the current time is before the release time

        // Read the release time from 'cur.txt'
        const releaseTime = parseInt(curContent);

        // Update the countdown display
        updateCountdownTime(formatDate(new Date(releaseTime)));

        // Start the countdown
        startCountdown(releaseTime);
      }
    });
  }

  // Initialize the countdown on page load
  initializeCountdown();
});

