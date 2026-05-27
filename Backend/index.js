// Garante que o Supabase já está inicializado no seu index.js igual ao Estoque.js
const SUPABASE_URL = 'https://dlmpmdcheqgvbcnpwjna.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OLelVWrA1IYBw3ySwz0qoA_L4W0CccQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault(); // Impede o erro 405 do navegador

            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            try {
                // 🔥 Faz o login diretamente pela API de Auth do Supabase
                const { data, error } = await _supabase.auth.signInWithPassword({
                    email: email,
                    password: senha,
                });

                if (error) throw error;

                // Se o login der certo, redireciona o usuário para a tela de estoque
                // Ajuste o caminho se a sua página de estoque estiver em outra pasta
                window.location.href = "Frontend/Estoque.html"; 

            } catch (err) {
                console.error("Erro na autenticação:", err.message);
                alert("Falha no login: " + err.message);
            }
        });
    }
});