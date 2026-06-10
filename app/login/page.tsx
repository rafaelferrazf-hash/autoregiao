async function handleLogin() {
  console.log("=== CLICOU ENTRAR ===");
  console.log("Email:", email);
  console.log("Senha preenchida:", senha.length > 0);
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!email || !senha) return setErro("Preencha e-mail e senha.");
  setErro("");
  setCarregando(true);

  try {
    console.log("Chamando supabase.auth.signInWithPassword...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    console.log("Resposta:", { data, error });

    setCarregando(false);

    if (error) {
      console.log("Erro:", error.message);
      if (error.message.includes("Invalid login")) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Erro ao entrar. Tente novamente.");
      }
    } else {
      setSucesso(true);
      setTimeout(() => { window.location.href = "/painel"; }, 1500);
    }
  } catch (e) {
    console.error("ERRO INESPERADO:", e);
    setCarregando(false);
    setErro("Erro inesperado. Veja o console.");
  }
}