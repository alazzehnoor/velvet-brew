const menuItems = [
  { id: 1, name: "Flat White", category: "hot", price: 4.50 },
  { id: 2, name: "Velvet Mocha", category: "hot", price: 5.00 },
  { id: 3, name: "Cortado", category: "hot", price: 3.80 },
  { id: 4, name: "Iced Latte", category: "cold", price: 4.80 },
  { id: 5, name: "Cold Brew", category: "cold", price: 4.20 },
  { id: 6, name: "Matcha Latte", category: "cold", price: 5.50 }
];

let cart = [];

function addToCart(drinkId) {
  const existingItem = cart.find(item => item.id === drinkId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const drink = menuItems.find(item => item.id === drinkId);
    if (drink) {
      cart.push({ ...drink, quantity: 1 });
    }
  }

  updateCartUI();
}

function removeFromCart(drinkId) {
  const itemIndex = cart.findIndex(item => item.id === drinkId);

  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
  }

  updateCartUI();
}

function updateCartUI() {
  const cartList = document.querySelector(".cart-items") || document.getElementById("cart-items");
  const totalDisplay = document.querySelector(".cart-total") || document.getElementById("cart-total");
  const cartCount = document.querySelector(".cart-count") || document.getElementById("cart-count");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalDisplay) {
    totalDisplay.textContent = `$${total.toFixed(2)}`;
  }

  if (cartCount) {
    cartCount.textContent = totalCount;
  }

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line, #d8c4b6);">
      <div>
        <div style="font-weight: 600; color: var(--text, #2b1d14);">${item.name}</div>
        <div style="font-size: 0.85rem; color: var(--text-soft, #5c3d28);">$${item.price.toFixed(2)} × ${item.quantity}</div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button type="button" onclick="removeFromCart(${item.id})" style="padding: 2px 8px; cursor: pointer;">-</button>
        <span style="min-width: 16px; text-align: center;">${item.quantity}</span>
        <button type="button" onclick="addToCart(${item.id})" style="padding: 2px 8px; cursor: pointer;">+</button>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".drink-card button, .drink-card .btn");

  addButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const drink = menuItems[index];
      if (drink) {
        addToCart(drink.id);
      }
    });
  });

  const orderBtn = document.querySelector(".checkout-form button") || document.getElementById("place-order-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty. Please select some drinks first!");
        return;
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            createdAt: new Date().toISOString()
          })
        });

       const data = await response.json();
      console.log("Order details:", data.receivedOrder);

      const itemsSummary = data.receivedOrder.items
        .map(item => `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

      alert(`${data.message}\n\nOrder Summary:\n${itemsSummary}\n\nTotal: $${data.receivedOrder.total.toFixed(2)}`);

      cart = [];
      updateCartUI();
    } catch (error) {
      alert("Failed to send order to server.");
    }
  });
}
});