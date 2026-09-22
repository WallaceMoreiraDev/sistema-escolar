import { app } from "./app.js";
import supabase from './repositories/supabaseClient.js';

const PORT = process.env.PORT || 5002;

async function testConnection() {
    console.log("Testando conexão com o Supabase...");
    const { data, error } = await supabase.from('schools').select('*');

    if (error) {
        console.error("Erro ao conectar no banco:", error.message);
    } else {
        console.log("Banco conectado! Escolas encontradas:", data);
    }
}

app.listen(PORT, () => {
    console.log(`Hello world! Servidor rodando na porta ${PORT}`);
    testConnection();
});