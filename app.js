/* MUSIC STORE POS SYSTEM - JAVASCRIPT */

//  CONFIGURATION
// API endpoint
const API_URL = "http://localhost:3000/api";

//  GLOBAL VARIABLES
let selectedProductId = null; // Currently selected product from catalog
let allProducts = []; // Array storing all products from database
let orderItems = []; // Array of items in current order

// PAGE INITIALIZATION
// Run when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadCatalog(); // Load products from database
  setupFormatCheckboxes(); // Setup format selection listeners
  setupCatalogSearch(); // Setup product search functionality
});

//  CATALOG LOADING
/**
 * Load product catalog from database and display in grid
 * Fetches inventory data and groups by product
 */
async function loadCatalog() {
  const catalogGrid = document.getElementById("catalogGrid");
  const filter = document.getElementById("catalogFilter").value;

  // Show loading message
  catalogGrid.innerHTML = '<div class="loading">Loading products...</div>';

  try {
    // Build API URL with filter parameter
    let url = `${API_URL}/inventory`;

    if (filter === "vinyl") url += "?formatId=1";
    else if (filter === "cd") url += "?formatId=2";
    else if (filter === "cassette") url += "?formatId=3";
    else if (filter === "lowstock") url += "?lowstock=true";

    // Fetch inventory data
    const response = await fetch(url);
    const result = await response.json();

    if (response.ok && result.data) {
      // Group inventory items by product
      const productMap = new Map();

      result.data.forEach((item) => {
        if (!productMap.has(item.ProductID)) {
          productMap.set(item.ProductID, {
            id: item.ProductID,
            title: item.Title,
            artist: item.Artist,
            genre: item.Genre,
            price: item.Price,
            formats: [],
          });
        }

        // Add format information to product
        productMap.get(item.ProductID).formats.push({
          id: item.FormatID,
          name:
            item.FormatID === 1
              ? "Vinyl"
              : item.FormatID === 2
              ? "CD"
              : "Cassette",
          quantity: item.Quantity,
          sku: item.SKU,
        });
      });

      // Convert map to array and display
      allProducts = Array.from(productMap.values());
      displayProducts(allProducts);
    } else {
      catalogGrid.innerHTML =
        '<div class="no-products">No products found.</div>';
    }
  } catch (error) {
    catalogGrid.innerHTML = `<div class="error">Error loading products: ${error.message}</div>`;
  }
}

/**
 * Display products in catalog grid
 * @param {Array} products - Array of product objects to display
 */
function displayProducts(products) {
  const catalogGrid = document.getElementById("catalogGrid");

  if (products.length === 0) {
    catalogGrid.innerHTML =
      '<div class="no-products">No products match your search.</div>';
    return;
  }

  catalogGrid.innerHTML = "";

  // Create card for each product
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = () => selectProduct(product.id);

    // Calculate total stock across all formats
    const totalStock = product.formats.reduce((sum, f) => sum + f.quantity, 0);
    const stockClass = totalStock < 10 ? "stock-low" : "stock-ok";

    // Build HTML for product card
    card.innerHTML = `
            <div class="product-id">ID: ${product.id}</div>
            <h3>${product.title}</h3>
            <div class="artist">by ${product.artist}</div>
            <div class="price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="formats">
                ${product.formats
                  .map(
                    (f) => `
                    <span class="format-badge ${f.name.toLowerCase()}">${
                      f.name
                    } (${f.quantity})</span>
                `
                  )
                  .join("")}
            </div>
            <div class="stock-info">
                Total Stock: <span class="${stockClass}">${totalStock}</span>
            </div>
        `;

    catalogGrid.appendChild(card);
  });
}

/**
 * Select a product from the catalog
 * Highlights the selected card
 * @param {number} productId - ID of product to select
 */
function selectProduct(productId) {
  selectedProductId = productId;

  // Remove previous selection highlighting
  document.querySelectorAll(".product-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Highlight clicked card
  event.target.closest(".product-card").classList.add("selected");
}

// SEARCH FUNCTIONALITY
/**
 * Setup real-time product search
 * Filters products as user types in search box
 */
function setupCatalogSearch() {
  const searchInput = document.getElementById("catalogSearch");
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    // Show all products if search is empty
    if (searchTerm === "") {
      displayProducts(allProducts);
      return;
    }

    // Filter products by search term
    const filtered = allProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.artist.toLowerCase().includes(searchTerm) ||
        product.genre.toLowerCase().includes(searchTerm)
    );

    displayProducts(filtered);
  });
}

//  MODAL MANAGEMENT
/**
 * Show interface modal with specified form
 * @param {string} interfaceType - Type of interface to show (order, customer, add, inventory, view)
 */
function showInterface(interfaceType) {
  const modal = document.getElementById("interfaceModal");
  const modalBody = document.getElementById("modalBody");

  let template;

  switch (interfaceType) {
    case "add":
      // Add Product interface
      template = document.getElementById("addTemplate").cloneNode(true);
      template.style.display = "block";
      modalBody.innerHTML = "";
      modalBody.appendChild(template);
      setupAddProductForm();
      break;

    case "inventory":
      // Restock Inventory interface
      if (!selectedProductId) {
        alert("Please select a product from the catalog first");
        return;
      }
      template = document.getElementById("inventoryTemplate").cloneNode(true);
      template.style.display = "block";
      modalBody.innerHTML = "";
      modalBody.appendChild(template);
      loadProductForInventory(selectedProductId);
      setupUpdateInventoryForm();
      break;

    case "view":
      // View Details interface
      if (!selectedProductId) {
        alert("Please select a product from the catalog first");
        return;
      }
      template = document.getElementById("viewTemplate").cloneNode(true);
      template.style.display = "block";
      modalBody.innerHTML = "";
      modalBody.appendChild(template);
      loadProductDetails(selectedProductId);
      break;

    case "customer":
      // Add Customer interface
      template = document.getElementById("customerTemplate").cloneNode(true);
      template.style.display = "block";
      modalBody.innerHTML = "";
      modalBody.appendChild(template);
      setupAddCustomerForm();
      break;

    case "order":
      // Process Sale / Create Order interface
      template = document.getElementById("orderTemplate").cloneNode(true);
      template.style.display = "block";
      modalBody.innerHTML = "";
      modalBody.appendChild(template);
      setupCreateOrderForm();
      break;
  }

  modal.style.display = "block";
}

/**
 * Close the modal window
 * Clears selected product
 */
function closeModal() {
  document.getElementById("interfaceModal").style.display = "none";
  selectedProductId = null;
  // Remove selection highlighting
  document.querySelectorAll(".product-card").forEach((card) => {
    card.classList.remove("selected");
  });
}

// Close modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("interfaceModal");
  if (event.target === modal) {
    closeModal();
  }
};

//  FORMAT CHECKBOX MANAGEMENT
/**
 * Setup event listeners for format checkboxes
 * Shows/hides quantity inputs based on checkbox state
 */
function setupFormatCheckboxes() {
  document.addEventListener("change", (e) => {
    if (e.target.id === "formatVinyl") {
      document.getElementById("vinylQuantity").style.display = e.target.checked
        ? "block"
        : "none";
    }
    if (e.target.id === "formatCD") {
      document.getElementById("cdQuantity").style.display = e.target.checked
        ? "block"
        : "none";
    }
    if (e.target.id === "formatCassette") {
      document.getElementById("cassetteQuantity").style.display = e.target
        .checked
        ? "block"
        : "none";
    }
  });
}

// INTERFACE 1: ADD NEW PRODUCT
/**
 * Setup form handler for adding new products
 * Validates input and sends to API
 */
function setupAddProductForm() {
  const form = document.getElementById("addProductForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("addProductMessage");

    // Collect selected formats and quantities
    const formats = [];
    if (document.getElementById("formatVinyl").checked) {
      formats.push({
        formatId: 1,
        quantity: parseInt(document.getElementById("vinylQty").value) || 0,
      });
    }
    if (document.getElementById("formatCD").checked) {
      formats.push({
        formatId: 2,
        quantity: parseInt(document.getElementById("cdQty").value) || 0,
      });
    }
    if (document.getElementById("formatCassette").checked) {
      formats.push({
        formatId: 3,
        quantity: parseInt(document.getElementById("cassetteQty").value) || 0,
      });
    }

    // Validate at least one format selected
    if (formats.length === 0) {
      showMessage(messageDiv, "Please select at least one format", "error");
      return;
    }

    // Collect product data
    const productData = {
      title: document.getElementById("title").value,
      artist: document.getElementById("artist").value,
      releaseDate: document.getElementById("releaseDate").value,
      genre: document.getElementById("genre").value,
      label: document.getElementById("label").value,
      price: parseFloat(document.getElementById("price").value),
      formats: formats,
    };

    try {
      // Send POST request to add product
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(
          messageDiv,
          "Product added successfully! ID: " + result.productId,
          "success"
        );
        form.reset();
        // Close modal and refresh catalog after 2 seconds
        setTimeout(() => {
          closeModal();
          loadCatalog();
        }, 2000);
      } else {
        showMessage(messageDiv, "Error: " + result.message, "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Error: " + error.message, "error");
    }
  });
}

// INTERFACE 2: RESTOCK INVENTORY
/**
 * Load product information for inventory update
 * Pre-fills form with current product data
 * @param {number} productId - ID of product to restock
 */
async function loadProductForInventory(productId) {
  try {
    const response = await fetch(`${API_URL}/inventory?productId=${productId}`);
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      const item = result.data[0];
      document.getElementById("invProductId").value = item.ProductID;
      document.getElementById(
        "invProductTitle"
      ).value = `${item.Title} by ${item.Artist}`;

      // Setup format change handler to show current quantity
      const formatSelect = document.getElementById("invFormat");
      formatSelect.addEventListener("change", () => {
        const formatId = parseInt(formatSelect.value);
        const inventory = result.data.find((d) => d.FormatID === formatId);
        if (inventory) {
          document.getElementById("currentQuantity").value = inventory.Quantity;
          document.getElementById("newQuantity").value = inventory.Quantity;
        } else {
          document.getElementById("currentQuantity").value = "N/A";
          document.getElementById("newQuantity").value = 0;
        }
      });
    }
  } catch (error) {
    console.error("Error loading product:", error);
  }
}

/**
 * Setup form handler for updating inventory
 */
function setupUpdateInventoryForm() {
  const form = document.getElementById("updateInventoryForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("updateInventoryMessage");

    const inventoryData = {
      productId: parseInt(document.getElementById("invProductId").value),
      formatId: parseInt(document.getElementById("invFormat").value),
      quantity: parseInt(document.getElementById("newQuantity").value),
    };

    try {
      // Send PUT request to update inventory
      const response = await fetch(`${API_URL}/inventory`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryData),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(messageDiv, "Inventory updated successfully!", "success");
        setTimeout(() => {
          closeModal();
          loadCatalog();
        }, 2000);
      } else {
        showMessage(messageDiv, "Error: " + result.message, "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Error: " + error.message, "error");
    }
  });
}

// INTERFACE 3: VIEW PRODUCT DETAILS
/**
 * Load and display complete product details
 * @param {number} productId - ID of product to view
 */
async function loadProductDetails(productId) {
  const detailsDiv = document.getElementById("productDetails");
  detailsDiv.innerHTML = '<div class="loading">Loading details...</div>';

  try {
    const response = await fetch(`${API_URL}/inventory?productId=${productId}`);
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      const item = result.data[0];
      const totalStock = result.data.reduce((sum, d) => sum + d.Quantity, 0);

      // Build HTML for product details
      let html = `
                <h3>${item.Title}</h3>
                <div class="detail-row">
                    <span class="detail-label">Product ID:</span>
                    <span class="detail-value">${item.ProductID}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Artist:</span>
                    <span class="detail-value">${item.Artist}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Genre:</span>
                    <span class="detail-value">${item.Genre}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">$${parseFloat(
                      item.Price
                    ).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Stock:</span>
                    <span class="detail-value">${totalStock}</span>
                </div>
                
                <h3 style="margin-top: 20px;">Inventory by Format</h3>
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th>Format</th>
                            <th>Quantity</th>
                            <th>SKU</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

      // Add row for each format
      result.data.forEach((inv) => {
        const formatName =
          inv.FormatID === 1 ? "Vinyl" : inv.FormatID === 2 ? "CD" : "Cassette";
        html += `
                    <tr>
                        <td>${formatName}</td>
                        <td>${inv.Quantity}</td>
                        <td>${inv.SKU}</td>
                    </tr>
                `;
      });

      html += `
                    </tbody>
                </table>
            `;

      detailsDiv.innerHTML = html;
    }
  } catch (error) {
    detailsDiv.innerHTML = `<div class="error">Error loading details: ${error.message}</div>`;
  }
}

// INTERFACE 4: ADD CUSTOMER
/**
 * Setup form handler for adding new customers
 */
function setupAddCustomerForm() {
  const form = document.getElementById("addCustomerForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("addCustomerMessage");

    const customerData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
    };

    try {
      // Send POST request to add customer
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(
          messageDiv,
          "Customer registered successfully! ID: " + result.customerId,
          "success"
        );
        form.reset();
        setTimeout(() => closeModal(), 2000);
      } else {
        showMessage(messageDiv, "Error: " + result.message, "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Error: " + error.message, "error");
    }
  });
}

// INTERFACE 5: PROCESS SALE / CREATE ORDER
/**
 * Setup form handler for creating orders
 */
function setupCreateOrderForm() {
  orderItems = [];
  document.getElementById("orderItemsList").innerHTML = "";
  document.getElementById("orderTotal").value = "$0.00";

  const form = document.getElementById("createOrderForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("createOrderMessage");

    // Validate at least one item in order
    if (orderItems.length === 0) {
      showMessage(
        messageDiv,
        "Please add at least one item to the order",
        "error"
      );
      return;
    }

    const orderData = {
      customerId: parseInt(document.getElementById("orderCustomerId").value),
      items: orderItems,
    };

    try {
      // Send POST request to create order
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(
          messageDiv,
          `Order created successfully! Order ID: ${
            result.orderId
          }, Total: $${result.totalAmount.toFixed(2)}`,
          "success"
        );
        setTimeout(() => {
          closeModal();
          loadCatalog(); // Refresh to show updated inventory
        }, 3000);
      } else {
        showMessage(messageDiv, "Error: " + result.message, "error");
      }
    } catch (error) {
      showMessage(messageDiv, "Error: " + error.message, "error");
    }
  });
}

/**
 * Search for customer by ID
 * Displays customer information when found
 */
async function searchCustomer() {
  const customerId = document.getElementById("orderCustomerId").value;
  if (!customerId) {
    alert("Please enter a customer ID");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/customers/${customerId}`);
    const result = await response.json();

    if (response.ok) {
      const customer = result.data;
      document.getElementById(
        "customerInfo"
      ).value = `${customer.FirstName} ${customer.LastName} - ${customer.Email}`;
    } else {
      alert("Customer not found");
      document.getElementById("customerInfo").value = "";
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
}

/**
 * Add new order item input fields
 * Creates a new item entry with product, format, quantity, and price inputs
 */
function addOrderItem() {
  const itemHtml = `
        <div class="order-item" style="border: 2px solid #8b6f47; padding: 10px; margin: 10px 0; border-radius: 5px;">
            <div class="form-group">
                <label>Product ID:</label>
                <input type="number" class="item-product-id" required>
            </div>
            <div class="form-group">
                <label>Format:</label>
                <select class="item-format" required>
                    <option value="">Select Format</option>
                    <option value="1">Vinyl</option>
                    <option value="2">CD</option>
                    <option value="3">Cassette</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" class="item-quantity" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Unit Price:</label>
                <input type="number" class="item-price" step="0.01" min="0" required>
            </div>
            <button type="button" onclick="removeOrderItem(this)" style="width: auto; padding: 5px 15px; background: #8b3a3a;">Remove</button>
            <button type="button" onclick="getInventoryInfo(this)" style="width: auto; padding: 5px 15px; margin-left: 5px;">Get Info</button>
        </div>
    `;

  document
    .getElementById("orderItemsList")
    .insertAdjacentHTML("beforeend", itemHtml);
}

/**
 * Remove an order item from the list
 * @param {HTMLElement} button - Remove button that was clicked
 */
function removeOrderItem(button) {
  button.closest(".order-item").remove();
  updateOrderTotal();
}

/**
 * Fetch inventory information for an order item
 * Auto-fills price from database
 * @param {HTMLElement} button - Get Info button that was clicked
 */
async function getInventoryInfo(button) {
  const itemDiv = button.closest(".order-item");
  const productId = itemDiv.querySelector(".item-product-id").value;
  const formatId = itemDiv.querySelector(".item-format").value;

  if (!productId || !formatId) {
    alert("Please select product and format first");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/inventory?productId=${productId}&formatId=${formatId}`
    );
    const result = await response.json();

    if (response.ok && result.data.length > 0) {
      const inv = result.data[0];
      itemDiv.querySelector(".item-price").value = inv.Price;
      alert(
        `Found: ${inv.Title} by ${inv.Artist}\nFormat: ${
          formatId == 1 ? "Vinyl" : formatId == 2 ? "CD" : "Cassette"
        }\nAvailable: ${inv.Quantity}\nPrice: $${inv.Price}`
      );
      updateOrderTotal();
    } else {
      alert("Product/format combination not found in inventory");
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
}

/**
 * Calculate and display order total
 * Sums up all item quantities × prices
 */
function updateOrderTotal() {
  let total = 0;
  document.querySelectorAll(".order-item").forEach((item) => {
    const quantity =
      parseFloat(item.querySelector(".item-quantity").value) || 0;
    const price = parseFloat(item.querySelector(".item-price").value) || 0;
    total += quantity * price;
  });
  document.getElementById("orderTotal").value = `$${total.toFixed(2)}`;
}

// Event delegation for order item changes
document.addEventListener("input", (e) => {
  if (e.target.matches(".item-quantity") || e.target.matches(".item-price")) {
    updateOrderTotal();
  }
});

// UTILITY FUNCTIONS
/**
 * Display success or error message
 * @param {HTMLElement} element - Message container element
 * @param {string} message - Message text to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = "block";
  // Auto-hide after 5 seconds
  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}
