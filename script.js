document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentPanes = document.querySelectorAll('.content-pane');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    sidebarItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            sidebarItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            const targetContentId = item.dataset.content;
            contentPanes.forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(targetContentId);
            if (targetPane) targetPane.classList.add('active');
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Submenu Toggle
    document.querySelectorAll('.sidebar-item.has-submenu').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                item.classList.toggle('expanded');
                submenu.classList.toggle('active');
            }
        });
    });

    // Mobile Sidebar Toggle
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('no-scroll', sidebar.classList.contains('active'));
        });
    }

    // Cerrar sidebar al hacer click fuera en móvil
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggleButton = sidebarToggleBtn && sidebarToggleBtn.contains(event.target);
            if (sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnToggleButton) {
                sidebar.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        }
    });

    // --- Carrito de compras ---
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Mostrar modal del carrito
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'flex';
    });

    // Cerrar modal del carrito
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutBtn.addEventListener('click', checkout);
    clearCartBtn.addEventListener('click', clearCart);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    updateCart();

    function addToCart(event) {
        const button = event.target;
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCart();

        // Feedback visual en el botón
        button.textContent = '✓ Añadido';
        button.style.backgroundColor = '#2ecc71';
        setTimeout(() => {
            button.textContent = 'Añadir al carrito';
            button.style.backgroundColor = '';
        }, 2000);
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartTotal();
        updateCartCount();
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío</p>';
            return;
        }
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-price">S/. ${item.price.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity" data-id="${item.id}">+</button>
                </div>
                <span class="remove-item" data-id="${item.id}"><i class="bi bi-trash"></i></span>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItem);
        });
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `S/. ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    function decreaseQuantity(event) {
        const id = event.target.getAttribute('data-id');
        const item = cart.find(item => item.id === id);
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== id);
        }
        updateCart();
    }

    function increaseQuantity(event) {
        const id = event.target.getAttribute('data-id');
        const item = cart.find(item => item.id === id);
        item.quantity += 1;
        updateCart();
    }

    function removeItem(event) {
        const id = event.currentTarget.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    function clearCart() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            cart = [];
            updateCart();
        }
    }

    function checkout() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
            return;
        }
        alert('¡Pago realizado con éxito! Gracias por tu compra.');
        cart = [];
        updateCart();
    }
});