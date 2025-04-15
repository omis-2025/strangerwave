// This script handles redirects from static pages back to the main application
// Add this to static HTML pages that should redirect back to the app after a certain action

document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners to any buttons or links with class 'back-to-app'
  const backButtons = document.querySelectorAll('.back-to-app');
  backButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/';
    });
  });
  
  // Handle automatic redirects based on URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTimeout = urlParams.get('redirect');
  
  if (redirectTimeout) {
    const seconds = parseInt(redirectTimeout, 10) || 5;
    const redirectElement = document.getElementById('redirect-countdown');
    
    if (redirectElement) {
      let count = seconds;
      redirectElement.textContent = count;
      
      const interval = setInterval(() => {
        count--;
        redirectElement.textContent = count;
        
        if (count <= 0) {
          clearInterval(interval);
          window.location.href = '/';
        }
      }, 1000);
    } else {
      // If no countdown element, just redirect after the timeout
      setTimeout(() => {
        window.location.href = '/';
      }, seconds * 1000);
    }
  }
});