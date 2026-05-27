document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) window.location.href = 'index.html';
    
    document.getElementById('userInfo').textContent = `${user.username} | ${user.role}`;
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    loadDashboard();
});

function navigate(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    const titles = {
        dashboard: 'Dashboard',
        suppliers: 'Gerenciar Fornecedores',
        evaluations: 'Avaliar Fornecedores',
        purchases: 'Registrar Compras',
        reports: 'Relatórios'
    };
    document.getElementById('pageTitle').textContent = titles[view];

    if (view === 'dashboard') loadDashboard();
    if (view === 'suppliers') loadSuppliers();
    if (view === 'evaluations') populateSupplierSelects('evalSupplier');
    if (view === 'purchases') populateSupplierSelects('purchSupplier');
    if (view === 'reports') loadReports();
}

async function loadDashboard() {
    const data = await fetchAPI('/dashboard');
    document.getElementById('dash-suppliers').textContent = data.totalSuppliers;
    document.getElementById('dash-rating').textContent = data.avgRating;
}

async function loadSuppliers() {
    const suppliers = await fetchAPI('/suppliers');
    const tbody = document.getElementById('suppliersTable');
    tbody.innerHTML = suppliers.map(s => `
        <tr>
            <td class="p-4">${s.name}</td>
            <td class="p-4">${s.category}</td>
            <td class="p-4 text-right">
                <button onclick="deleteSupplier(${s.id})" class="text-red-500 hover:underline">Excluir</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('supName').value;
    const category = document.getElementById('supCategory').value;
    await fetchAPI('/suppliers', { method: 'POST', body: JSON.stringify({ name, category }) });
    e.target.reset();
    loadSuppliers();
});

async function deleteSupplier(id) {
    await fetchAPI(`/suppliers/${id}`, { method: 'DELETE' });
    loadSuppliers();
}

async function populateSupplierSelects(selectId) {
    const suppliers = await fetchAPI('/suppliers');
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">Selecione...</option>` + 
        suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

document.getElementById('evalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const supplier = document.getElementById('evalSupplier').value;
    const rating = parseInt(document.getElementById('evalRating').value);
    const comment = document.getElementById('evalComment').value;
    await fetchAPI('/evaluations', { method: 'POST', body: JSON.stringify({ supplier, rating, comment }) });
    e.target.reset();
    alert('Avaliação salva!');
});

document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const supplier = document.getElementById('purchSupplier').value;
    const value = parseFloat(document.getElementById('purchValue').value);
    const date = document.getElementById('purchDate').value;
    await fetchAPI('/purchases', { method: 'POST', body: JSON.stringify({ supplier, value, date }) });
    e.target.reset();
    alert('Compra registrada!');
});

async function loadReports() {
    const purchases = await fetchAPI('/purchases');
    const tbody = document.getElementById('reportsPurchasesTable');
    tbody.innerHTML = purchases.map(p => `
        <tr>
            <td class="p-4">${p.date}</td>
            <td class="p-4">${p.supplier}</td>
            <td class="p-4">R$ ${p.value.toFixed(2)}</td>
        </tr>
    `).join('');
}