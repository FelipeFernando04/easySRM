let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(sessionStorage.getItem('user'));
    if (!currentUser) window.location.href = 'index.html';
    
    document.getElementById('userInfo').textContent = 
        `${currentUser.role === 'Fornecedor' ? currentUser.storeName : currentUser.name} | ${currentUser.role}`;
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    renderMenu();
});

function renderMenu() {
    const menu = document.getElementById('menu');
    if (currentUser.role === 'Comprador') {
        menu.innerHTML = `
            <button onclick="navigate('vitrine')" class="w-full text-left p-3 rounded hover:bg-slate-800">Vitrine</button>
            <button onclick="navigate('meus-pedidos')" class="w-full text-left p-3 rounded hover:bg-slate-800">Meus Pedidos</button>
        `;
        navigate('vitrine');
    } else if (currentUser.role === 'Fornecedor') {
        menu.innerHTML = `
            <button onclick="navigate('meus-produtos')" class="w-full text-left p-3 rounded hover:bg-slate-800">Meus Produtos</button>
            <button onclick="navigate('pedidos-recebidos')" class="w-full text-left p-3 rounded hover:bg-slate-800">Pedidos Recebidos</button>
        `;
        navigate('meus-produtos');
    }
}

function navigate(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    const titles = {
        'vitrine': 'Vitrine de Produtos',
        'meus-pedidos': 'Meus Pedidos',
        'meus-produtos': 'Gerenciar Catálogo',
        'pedidos-recebidos': 'Vendas Recebidas'
    };
    document.getElementById('pageTitle').textContent = titles[view];

    if (view === 'vitrine') loadVitrine();
    if (view === 'meus-pedidos') loadMeusPedidos();
    if (view === 'meus-produtos') loadMeusProdutos();
    if (view === 'pedidos-recebidos') loadPedidosRecebidos();
}

// ================= LÓGICA DO COMPRADOR =================

async function loadVitrine() {
    const products = await fetchAPI('/products');
    const grid = document.getElementById('produtosGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-slate-500">Nenhum produto disponível no momento.</p>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col">
            <h3 class="font-bold text-lg">${p.name}</h3>
            <p class="text-sm text-slate-500 mb-4">Vendido por: ${p.storeName}</p>
            <p class="text-2xl font-bold text-blue-600 mb-4">R$ ${p.price.toFixed(2)}</p>
            <div class="mt-auto flex gap-2">
                <input type="number" id="qtd-${p.id}" value="1" min="1" class="w-16 border p-2 rounded">
                <button onclick="fazerPedido(${p.id}, '${p.name}', ${p.price}, '${p.storeName}', ${p.supplierId})" class="flex-1 bg-green-600 text-white rounded hover:bg-green-700 font-medium">Comprar</button>
            </div>
        </div>
    `).join('');
}

async function fazerPedido(productId, productName, price, storeName, supplierId) {
    const qtd = parseInt(document.getElementById(`qtd-${productId}`).value);
    const total = price * qtd;

    const orderData = {
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        supplierId: supplierId,
        storeName: storeName,
        productId: productId,
        productName: productName,
        quantity: qtd,
        total: total
    };

    await fetchAPI('/orders', { method: 'POST', body: JSON.stringify(orderData) });
    alert(`Pedido de ${qtd}x ${productName} enviado para ${storeName}!`);
}

async function loadMeusPedidos() {
    const allOrders = await fetchAPI('/orders');
    const myOrders = allOrders.filter(o => o.buyerId === currentUser.id);
    const tbody = document.getElementById('meusPedidosTable');
    
    tbody.innerHTML = myOrders.map(o => `
        <tr>
            <td class="p-4">${o.date}</td>
            <td class="p-4"><b>${o.quantity}x</b> ${o.productName}</td>
            <td class="p-4">${o.storeName}</td>
            <td class="p-4 font-semibold">R$ ${o.total.toFixed(2)}</td>
            <td class="p-4"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">${o.status}</span></td>
        </tr>
    `).join('');
}

// ================= LÓGICA DO FORNECEDOR =================

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    
    await fetchAPI('/products', { 
        method: 'POST', 
        body: JSON.stringify({ 
            name, 
            price, 
            supplierId: currentUser.id,
            storeName: currentUser.storeName
        }) 
    });
    
    e.target.reset();
    loadMeusProdutos();
});

async function loadMeusProdutos() {
    const allProducts = await fetchAPI('/products');
    const myProducts = allProducts.filter(p => p.supplierId === currentUser.id);
    const tbody = document.getElementById('meusProdutosTable');
    
    tbody.innerHTML = myProducts.map(p => `
        <tr>
            <td class="p-4">${p.name}</td>
            <td class="p-4">R$ ${p.price.toFixed(2)}</td>
            <td class="p-4 text-right">
                <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:underline">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function deleteProduct(id) {
    if(confirm('Tem certeza que deseja excluir este produto?')) {
        await fetchAPI(`/products/${id}`, { method: 'DELETE' });
        loadMeusProdutos();
    }
}

async function loadPedidosRecebidos() {
    const allOrders = await fetchAPI('/orders');
    const mySales = allOrders.filter(o => o.supplierId === currentUser.id);
    const tbody = document.getElementById('pedidosRecebidosTable');
    
    tbody.innerHTML = mySales.map(o => `
        <tr>
            <td class="p-4">${o.date}</td>
            <td class="p-4">${o.buyerName}</td>
            <td class="p-4">${o.productName}</td>
            <td class="p-4">${o.quantity}</td>
            <td class="p-4 font-bold text-green-600">R$ ${o.total.toFixed(2)}</td>
        </tr>
    `).join('');
}