
// Function to show/hide orders based on auth status
function handleOrdersVisibility() {
  const isLoggedIn = localStorage.getItem('accessToken');
  const tableBody = document.querySelector('.orders-table tbody');
  
  if (!tableBody) return;
  
  if (!isLoggedIn) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px;">
          <div style="font-size: 1.2rem; margin-bottom: 20px;">
            Please sign in to view your orders
          </div>
        </td>
      </tr>
    `;
  } else {
   
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  handleOrdersVisibility(); 
});

