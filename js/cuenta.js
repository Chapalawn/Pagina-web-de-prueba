const tabLogin = document.getElementById("tab-login");
const tabRegistro = document.getElementById("tab-registro");
const panelLogin = document.getElementById("panel-login");
const panelRegistro = document.getElementById("panel-registro");
const irRegistro = document.getElementById("ir-registro");
const irLogin = document.getElementById("ir-login");
const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");
const googleLogin = document.getElementById("google-login");
const mensaje = document.getElementById("cuenta-mensaje");

function cambiarPanel(panel) {
    const mostrarLogin = panel === "login";

    tabLogin.classList.toggle("activo", mostrarLogin);
    tabRegistro.classList.toggle("activo", !mostrarLogin);

    tabLogin.setAttribute("aria-selected", String(mostrarLogin));
    tabRegistro.setAttribute("aria-selected", String(!mostrarLogin));

    panelLogin.hidden = !mostrarLogin;
    panelRegistro.hidden = mostrarLogin;

    panelLogin.classList.toggle("activo", mostrarLogin);
    panelRegistro.classList.toggle("activo", !mostrarLogin);

    mensaje.textContent = "";
}

tabLogin.addEventListener("click", () => cambiarPanel("login"));
tabRegistro.addEventListener("click", () => cambiarPanel("registro"));
irRegistro.addEventListener("click", () => cambiarPanel("registro"));
irLogin.addEventListener("click", () => cambiarPanel("login"));

formLogin.addEventListener("submit", evento => {
    evento.preventDefault();
    mensaje.textContent =
        "Demo visual: el inicio de sesión real se conectará más adelante a un servicio de autenticación seguro.";
});

formRegistro.addEventListener("submit", evento => {
    evento.preventDefault();

    const password =
        document.getElementById("registro-password").value;

    const confirmar =
        document.getElementById("registro-password-confirmar").value;

    if (password !== confirmar) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        return;
    }

    mensaje.textContent =
        "Demo visual: la cuenta no fue creada ni se guardó información.";
});

googleLogin.addEventListener("click", () => {
    mensaje.textContent =
        "Demo visual: el acceso con Google se habilitará al conectar la autenticación real.";
});
