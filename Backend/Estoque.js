// 🔥 CONEXÃO SUPABASE (GLOBAL)
const SUPABASE_URL = 'https://dlmpmdcheqgvbcnpwjna.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OLelVWrA1IYBw3ySwz0qoA_L4W0CccQ';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔥 FUNÇÃO GLOBAL PARA O AVISO FLUTUANTE (Tem que ficar aqui fora!)
function mostrarAviso(mensagem, cor = '#10b981') {
    const aviso = document.createElement('div');
    aviso.innerText = mensagem;
    aviso.style.position = 'fixed';
    aviso.style.bottom = '20px';
    aviso.style.right = '20px';
    aviso.style.backgroundColor = cor;
    aviso.style.color = 'white';
    aviso.style.padding = '15px 25px';
    aviso.style.borderRadius = '8px';
    aviso.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
    aviso.style.zIndex = '9999';
    aviso.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(aviso);
    
    // Some sozinho após 3 segundos
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.remove(), 500);
    }, 3000);
}

// 🔥 FUNÇÃO GLOBAL (IMPORTANTE)
async function carregarDados() {
    try {
        const { data, error } = await _supabase
            .from('Estoque')
            .select('Estoque_id, quantidade_total, Tamanho, valor_unitario, fornecedor, Produto, categoria');

        if (error) throw error;

        const corpoTabela = document.getElementById('table-body');
        corpoTabela.innerHTML = '';

        if (!data || data.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum produto no estoque.</td></tr>';
            return;
        }

        const limiteAlerta = Number(localStorage.getItem('limiteEstoque')) || 5;

        data.forEach(item => {
            const qtd = item.quantidade_total;
            let statusTexto = '';
            let statusClasse = '';

            // Lógica do Status
            if (qtd <= 0) {
                statusTexto = 'Sem estoque';
                statusClasse = 'bg-danger';
            } else if (qtd <= limiteAlerta) {
                statusTexto = 'Perigoso ⚠️';
                statusClasse = 'bg-warning'; // Cor de alerta
            } else {
                statusTexto = 'Em estoque';
                statusClasse = 'bg-success';
            }

            corpoTabela.innerHTML += `
                <tr>
                    <td>${item.Produto || '-'}</td>
                    <td>${item.fornecedor || '-'}</td>
                    <td>${item.Tamanho || '-'}</td>
                    <td>${item.categoria || '-'}</td>
                    <td>R$ ${item.valor_unitario || 0}</td>
                    <td>${item.quantidade_total || 0}</td>
                    <td>
                        <span class="badge ${statusClasse}">
                            ${statusTexto}
                        </span>
                    </td>
                   
                    <td>
                      <button class="btn-editar" onclick="editarProduto('${item.Estoque_id}')">✏️</button>
                      <button class="btn-excluir" onclick="excluirProduto('${item.Estoque_id}')">🗑️</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar banco:", err.message);
    }
}

// 🔥 FUNÇÃO EXCLUIR
async function excluirProduto(id) {
    const confirmar = confirm("Deseja excluir este produto?");
    if (!confirmar) return;

    try {
        const { error } = await _supabase
            .from('Estoque')
            .delete()
            .eq('Estoque_id', id);

        if (error) throw error;

        mostrarAviso("Produto excluído com sucesso!");
        carregarDados();

    } catch (err) {
        console.error("Erro ao excluir:", err.message);
        mostrarAviso("Erro ao excluir produto.", '#ef4444');
    }
}

// 🔥 FUNÇÃO EDITAR

// 🔥 Variável global para rastrear se estamos editando e qual ID está sendo editado
let produtoSendoEditadoId = null;

// 🔥 NOVA FUNÇÃO EDITAR COM MODAL
async function editarProduto(id) {
    try {
        // 1. Busca os dados atuais do produto específico no Supabase
        const { data, error } = await _supabase
            .from('Estoque')
            .select('*')
            .eq('Estoque_id', id)
            .single(); // Traz apenas um registro

        if (error) throw error;

        // 2. Preenche os inputs do modal com os dados retornados
        document.getElementById("produto").value = data.Produto || "";
        document.getElementById("fornecedor").value = data.fornecedor || "";
        document.getElementById("tamanho").value = data.Tamanho || "";
        document.getElementById("categoria").value = data.categoria || "";
        document.getElementById("valor").value = data.valor_unitario || "";
        document.getElementById("quantidade").value = data.quantidade_total || "";

        // 3. Altera o título do modal para o usuário saber que está editando
        document.querySelector("#modal h2").innerText = "Editar Produto";

        // 4. Salva o ID do produto na variável de controle
        produtoSendoEditadoId = id;

        // 5. Abre o modal
        document.getElementById("modal").style.display = "flex";

    } catch (err) {
        console.error("Erro ao buscar dados para edição:", err.message);
        mostrarAviso("Erro ao carregar dados do produto.", '#ef4444');
    }
}
// 🔥 DOM CARREGADO
document.addEventListener("DOMContentLoaded", () => {

    // MENU
    document.getElementById("opem_btn").addEventListener("click", function () {
        document.getElementById("sidebar").classList.toggle("open-sidebar");
    });

    // MODAL
    const modal = document.getElementById("modal");

    document.getElementById("btn-adicionar").addEventListener("click", () => {
        modal.style.display = "flex";
    });

    document.getElementById("fechar").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // SALVAR
    // 🔥 Aqui estava faltando o 'e' dentro dos parênteses -> (e)
    document.getElementById("salvar").addEventListener("click", async (e) => {
        e.preventDefault(); 
        const Produto = document.getElementById("produto").value;
        const fornecedor = document.getElementById("fornecedor").value;
        const Tamanho = document.getElementById("tamanho").value;
        const categoria = document.getElementById("categoria").value;
        const valor_unitario = document.getElementById("valor").value;
        const quantidade_total = document.getElementById("quantidade").value;

        if (!Produto) {
            mostrarAviso("Produto é obrigatório!", '#ef4444');
            return;
        }

        try {
            const { error } = await _supabase
                .from('Estoque')
                .insert([
                    {
                        Produto,
                        fornecedor,
                        Tamanho,
                        categoria,
                        valor_unitario: Number(valor_unitario),
                        quantidade_total: Number(quantidade_total)
                    }
                ]);

            if (error) throw error;

            mostrarAviso("Produto adicionado com sucesso!");
            modal.style.display = "none";

            // Limpar os campos após salvar
            document.getElementById("produto").value = "";
            document.getElementById("fornecedor").value = "";
            document.getElementById("tamanho").value = "";
            document.getElementById("categoria").value = "";
            document.getElementById("valor").value = "";
            document.getElementById("quantidade").value = "";

            carregarDados();

        } catch (err) {
            console.error("Erro ao salvar:", err.message);
            mostrarAviso("Erro ao salvar produto.", '#ef4444');
        }
    });

    // CARREGA DADOS AO ABRIR
    carregarDados();
});