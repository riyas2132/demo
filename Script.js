	function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
		showLoading();
		function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
        // Replace with your Google Sheets API key
        const API_KEY = 'AIzaSyByyiuwuJBysKl2xtvl6wCw6Gz9shyDzXs';
        // Replace with your Google Sheet ID
        const SHEET_ID = '1JziliJ6oVkgMlm-Aa2jMc2s4LBSgHpZCoEaXTd9u9s0';
        // Replace with your sheet name and extend the range to include columns R and S
        const SHEET_NAME = 'Sheet1!A:S';

        let cart = {};
        let products = [];
        let categories = [];
        let shopName = 'Shop Name'; // Default value
        let shopEmail = 'info@yourshop.com'; // Default value
        let Phone = '000000'; // Default value
		let Facebook = 'https://www.facebook.com'; // Default value
		let Twitter = 'https://www.twitter.com'; // Default value
		let Instagram = 'https://www.instagram.com'; // Default value
		let Linkedin = 'https://www.linkedin.com'; // Default value

        function initClient() {
    showLoading(); // Show loading animation
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(function () {
        loadSheetsData();
    }, function (error) {
        console.log('Error initializing GAPI client: ' + error);
        hideLoading(); // Hide loading animation in case of error
    });
}

        function loadSheetsData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SHEET_NAME
    }).then(function (response) {
        const data = response.result.values;
        const productGrid = document.getElementById('productGrid');

        // Initialize variables for color customization
        let primaryColor = '#1976D2'; // Default primary color
        let secondaryColor = '#E3F2FD'; // Default secondary color
        let accentColor = '#FFFFFF'; // Default accent color

        // Look for the ShopName, Email, Phone, and Colour in the data
        data.forEach(function (row) {
            if (row[17] === 'ShopName') {
                shopName = row[18];
                updateShopName();
            }
            if (row[17] === 'Email') {
                shopEmail = row[18];
            }
            if (row[17] === 'Phone') {
                Phone = row[18];
            }
			if (row[17] === 'Facebook') {
                Facebook = row[18];
            }
			if (row[17] === 'Twitter') {
                Twitter = row[18];
            }
			if (row[17] === 'Instagram') {
                Instagram = row[18];
            }
			if (row[17] === 'Linkedin') {
                Linkedin = row[18];
            }
            if (row[17] === 'Colour') {
                [primaryColor, secondaryColor, accentColor] = row[18].split(',');
                updateColors(primaryColor, secondaryColor, accentColor);
            }
            updateShopEmailPhone();
			updateSocialMedia(Facebook,Twitter,Instagram,Linkedin);
			
        });

        data.forEach(function (row, index) {
            if (row[0] && row[1] && row[2]) {
                products.push({ code: row[0], 
								price: parseFloat(row[1]), 
								oldPrice: parseFloat(row[4]), 
								image: row[2], 
								category: row[3] });
                if (!categories.includes(row[3])) {
                    categories.push(row[3]);
                }
                const productCard = createProductCard(index);
                productGrid.appendChild(productCard);
            }
        });

        renderCategories();
		hideLoading(); // Hide loading animation when data is loaded and rendered
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
		hideLoading(); // Hide loading animation in case of error
    });
}

function updateColors(primaryColor, secondaryColor, accentColor) {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);

    // Update inline styles if necessary
    document.querySelector('.custom-header').style.backgroundColor = primaryColor;
    document.querySelector('.navbar-brand').style.color = accentColor;
    document.querySelector('body').style.backgroundColor = secondaryColor;
    document.querySelector('body').style.color = primaryColor;
    document.querySelectorAll('.product-heading, .btn-outline-secondary').forEach(element => {
        element.style.color = primaryColor;
        element.style.borderColor = primaryColor;
    });
    document.querySelectorAll('.btn-outline-secondary:hover').forEach(element => {
        element.style.color = accentColor;
        element.style.backgroundColor = primaryColor;
    });
    document.querySelector('.footer').style.backgroundColor = primaryColor;
    document.querySelector('.footer').style.color = accentColor;
}


        function createProductCard(index) {
    const product = products[index];
    const productCard = document.createElement('div');
    productCard.className = 'col';
    productCard.innerHTML = 
        `<div class="card h-100 product-card">
            <img src="${product.image}" class="card-img-top product-image" alt="${product.code}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.code}</h5>
                
			<p class="card-text">
    ${product.oldPrice > product.price ? 
        `<span style="color: red;" class="text-decoration-line-through">AED ${product.oldPrice.toFixed(2)}</span> ` : 
        ''}
    <span class="text-primary">AED ${product.price.toFixed(2)}</span>
</p>
				
				
                <div class="mt-auto">
                    <div class="input-group quantity-control">
                        <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${index}, -1)">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="text" class="form-control quantity-input" id="quantity-${index}" value="${cart[index] || 0}" readonly>
                        <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${index}, 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    return productCard;
}

        function renderCategories() {
    const categoryContainer = document.getElementById('productCategories');
    categoryContainer.innerHTML = 
        `<button class="btn btn-primary m-1" onclick="setCategoryAndFilter('All')">All</button>
        ${categories.map(category => 
            `<button class="btn btn-outline-secondary m-1" onclick="setCategoryAndFilter('${category}')">${category}</button>`
        ).join('')}`;
}

        function filterProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const currentCategory = document.querySelector('#productCategories .btn-primary').textContent;
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    products.forEach((product, index) => {
        const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
        const matchesSearch = product.code.toLowerCase().includes(searchInput);

        if (matchesCategory && matchesSearch) {
            const productCard = createProductCard(index);
            productGrid.appendChild(productCard);
        }
    });
}
function setCategoryAndFilter(category) {
    const buttons = document.querySelectorAll('#productCategories .btn');
    buttons.forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    event.target.classList.remove('btn-outline-secondary');
    event.target.classList.add('btn-primary');
    filterProducts();
}
        function updateShopName() {
            // Update shop name in navbar
            document.querySelector('.navbar-brand').textContent = shopName;

            // Update shop name in footer
            document.querySelector('.footer h5').textContent = 'About ' + shopName;
            document.querySelector('.footer p').textContent = shopName + ' is dedicated to providing high-quality products and excellent customer service.';
            document.querySelector('.footer .text-center p').textContent = '© 2024 ' + shopName + '. All rights reserved.';
        }

        function updateShopEmailPhone() {
            // Update shop email in footer
            document.querySelector('.footer .col-md-4:nth-child(2) p').innerHTML = `Email: ${shopEmail}<br>Phone: ${Phone}`;
            document.getElementById('callButton').href = `tel:+${Phone}`;
            document.getElementById('whatsappButton').href = `https://wa.me/${Phone}`;
        }
        function updateSocialMedia(Facebook,Twitter,Instagram,Linkedin) {
			document.getElementById('facebookLink').href = Facebook; 
			document.getElementById('twitterLink').href = Twitter; 
			document.getElementById('instagramLink').href = Instagram; 
			document.getElementById('linkedinLink').href = Linkedin; 
			 
			}

function changeQuantity(index, change) {
    const quantityInput = document.getElementById(`quantity-${index}`);
    const modalQuantitySpan = document.getElementById(`modal-quantity-${index}`);
    
    let newQuantity = (cart[index] || 0) + change;
    newQuantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0

    if (newQuantity === 0) {
        delete cart[index];
    } else {
        cart[index] = newQuantity;
    }

    // Update main product grid
    if (quantityInput) {
        quantityInput.value = newQuantity;
    }

    // Update cart modal
    if (modalQuantitySpan) {
        modalQuantitySpan.textContent = newQuantity;
        const product = products[index];
        const itemTotal = product.price * newQuantity;
        const modalTotalSpan = document.getElementById(`modal-total-${index}`);
        if (modalTotalSpan) {
            modalTotalSpan.textContent = `AED ${itemTotal.toFixed(2)}`;
        }

        // Recalculate and update grand total
        let grandTotal = 0;
        for (const [idx, qty] of Object.entries(cart)) {
            grandTotal += products[idx].price * qty;
        }
        const modalGrandTotal = document.getElementById('modal-grand-total');
        if (modalGrandTotal) {
            modalGrandTotal.textContent = `AED ${grandTotal.toFixed(2)}`;
        }
    }

    updateCartButton();
}

        function updateCartButton() {
            const cartButton = document.getElementById('cartButton');
            const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
            const totalPrice = Object.entries(cart).reduce((total, [index, quantity]) => {
                return total + (products[index].price * quantity);
            }, 0);

            if (totalItems > 0) {
                cartButton.style.display = 'block';
                cartButton.textContent = `Proceed to Cart (${totalItems} items, AED ${totalPrice.toFixed(2)})`;
            } else {
                cartButton.style.display = 'none';
            }
        }

        function clearCart() {
    cart = {};
    products.forEach((product, index) => {
        const quantityInput = document.getElementById(`quantity-${index}`);
        if (quantityInput) {
            quantityInput.value = 0;
        }
    });
    updateCartButton();

    // Hide the cart modal
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) {
        cartModal.hide();
    }
}


function showCartModal() {
    const modalBody = document.getElementById('cartModalBody');
    let cartContent = '<ul class="list-group">';
    let total = 0;

    for (const [index, quantity] of Object.entries(cart)) {
        const product = products[index];
        const itemTotal = product.price * quantity;
        total += itemTotal;
        cartContent += 
            `<li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="changeQuantity(${index}, -1)">-</button>
                    <span id="modal-quantity-${index}">${quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="changeQuantity(${index}, 1)">+</button>
                    ${product.code}  
                    <span class="text-primary">AED ${product.price.toFixed(2)}</span>
                </div>
                <span id="modal-total-${index}">AED ${itemTotal.toFixed(2)}</span>
            </li>`;
    }

    cartContent += 
        `<li class="list-group-item d-flex justify-content-between align-items-center fw-bold">
            Total
            <span id="modal-grand-total">AED ${total.toFixed(2)}</span>
        </li>
    </ul>`;

    modalBody.innerHTML = cartContent;

    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

        function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card, index) => {
        const productName = products[index].code.toLowerCase();
        if (productName.includes(searchInput)) {
            card.parentElement.style.display = '';
        } else {
            card.parentElement.style.display = 'none';
        }
    });
}

        document.getElementById('cartButton').onclick = function () {
            if (Object.keys(cart).length > 0) {
                showCartModal();
            } else {
                alert('Your cart is empty!');
            }
        };

        document.getElementById('proceedToWhatsApp').onclick = function () {
            let message = "I'd like to order the following items:\n\n";
            let total = 0;
            for (const [index, quantity] of Object.entries(cart)) {
                const product = products[index];
                const itemTotal = product.price * quantity;
                total += itemTotal;
                message += `${quantity}x ${product.code} - AED ${product.price.toFixed(2)} each = AED ${itemTotal.toFixed(2)}\n`;
            }
            message += `\nTotal: AED ${total.toFixed(2)}`;
            message += "\n\nPlease confirm my order. Thank you!";

            const encodedMessage = encodeURIComponent(message);
            const whatsappLink = `https://wa.me/${Phone}?text=${encodedMessage}`;

            window.open(whatsappLink, '_blank');

            clearCart();
        };

        gapi.load('client', initClient);
		document.getElementById('searchInput').oninput = debounce(filterProducts, 300);