window.addEventListener('DOMContentLoaded', (event) => {
  // Check if the countdown end date is stored in the text file
  fetch('countdown.txt')
    .then(response => response.text())
    .then(data => {
      if (data.trim() !== '') {
        // If the text file has a date, display the countdown
        const countdownEndDate = new Date(data);
        startCountdown(countdownEndDate);
      } else {
        // If the text file is empty, show the date selection form
        document.getElementById('date-form').style.display = 'block';
      }
    });
});

document.getElementById('submit-btn').addEventListener('click', (event) => {
  event.preventDefault();

  const minDateInput = document.getElementById('min-date');
  const maxDateInput = document.getElementById('max-date');

  const minDate = new Date(minDateInput.value);
  const maxDate = new Date(maxDateInput.value);

  if (minDate >= maxDate) {
    alert('Invalid date range! Please make sure the maximum date is greater than the minimum date.');
    return;
  }

  const currentDate = new Date();
  if (currentDate >= minDate) {
    alert('Invalid minimum date! Please make sure the minimum date is greater than the current date.');
    return;
  }

  // Generate a random date between the minimum and maximum dates
  const randomDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));

  // Save the random date to the text file
  fetch('countdown.txt', {
    method: 'PUT',
    body: randomDate.toISOString(),
  })
    .then(() => {
      // Start the countdown
      startCountdown(randomDate);

      // Hide the date selection form
      document.getElementById('date-form').style.display = 'none';
    })
    .catch(error => {
      console.error('Error saving date to text file:', error);
    });
});

function startCountdown(endDate) {
  const countdownElement = document.getElementById('countdown');
  const congratulationsElement = document.getElementById('congratulations');
  const newTimerBtn = document.getElementById('new-timer-btn');

  // Update the countdown every second
  const countdownInterval = setInterval(() => {
    const currentDate = new Date();
    const timeDifference = endDate - currentDate;

    if (timeDifference <= 0) {
      // Clear the countdown interval when the countdown is finished
      clearInterval(countdownInterval);

      // Display the "Congratulations" message and new timer button
      countdownElement.style.display = 'none';
      congratulationsElement.style.display = 'block';
      newTimerBtn.style.display = 'block';
    } else {
      // Calculate the remaining time
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      // Display the countdown
      countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

document.getElementById('new-timer-btn').addEventListener('click', (event) => {
  event.preventDefault();

  // Delete the entry in the text file
  fetch('countdown.txt', {
    method: 'DELETE'
  })
    .then(() => {
      // Reload the page
      location.reload();
    })
    .catch(error => {
      console.error('Error deleting date from text file:', error);
    });
});
