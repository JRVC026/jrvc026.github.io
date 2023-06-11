window.addEventListener('DOMContentLoaded', (event) => {
  // Check if the countdown end date is stored in local storage
  let countdownEndDate = localStorage.getItem('countdownEndDate');
  
  if (countdownEndDate) {
    // If countdown end date exists, start the countdown
    startCountdown(new Date(countdownEndDate));
  } else {
    // If countdown end date doesn't exist, show the date selection form
    document.getElementById('date-form').style.display = 'block';
  }
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

  // Save the random date to local storage
  localStorage.setItem('countdownEndDate', randomDate);

  // Start the countdown
  startCountdown(randomDate);

  // Hide the date selection form
  document.getElementById('date-form').style.display = 'none';
});

function startCountdown(endDate) {
  const countdownElement = document.getElementById('countdown');

  // Update the countdown every second
  const countdownInterval = setInterval(() => {
    const currentDate = new Date();
    const timeDifference = endDate - currentDate;

    if (timeDifference <= 0) {
      // Clear the countdown interval when the countdown is finished
      clearInterval(countdownInterval);

      // Remove the countdown end date from local storage
      localStorage.removeItem('countdownEndDate');

      // Show the date selection form again
      document.getElementById('date-form').style.display = 'block';
    }

      // Calculate the remaining time (continued)
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // Display the countdown
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  }, 1000);
}
