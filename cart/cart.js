document.addEventListener("DOMContentLoaded", () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartList = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartList) {
    console.warn("Cart list element not found.");
    return;
  }

  if (cartItems.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
    if (cartTotal) cartTotal.textContent = "Total: $0.00";
    return;
  }

  let total = 0;

  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}`;
    cartList.appendChild(li);
    total += item.price * item.qty;
  });

  if (cartTotal) {
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }
});
