const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret_key", // Substitua por uma chave secreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Configuração para ambiente de desenvolvimento (sem HTTPS)
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

let produtos = [];

// Middleware para verificar login
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Rotas
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (username) {
    req.session.user = username;
    res.cookie("lastAccess", new Date().toLocaleString());
    res.redirect("/cadastro");
  } else {
    res.redirect("/login");
  }
});

app.get("/cadastro", isAuthenticated, (req, res) => {
  const lastAccess = req.cookies.lastAccess || "N/A";
  const produtosList = produtos
    .map(
      (produto) => `
    <tr>
      <td>${produto.barcode}</td>
      <td>${produto.description}</td>
      <td>${produto.costPrice}</td>
      <td>${produto.salePrice}</td>
      <td>${produto.expiryDate}</td>
      <td>${produto.stock}</td>
      <td>${produto.manufacturer}</td>
    </tr>
  `
    )
    .join("");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/css/styles.css">
      <title>Cadastro de Produtos</title>
    </head>
    <body>
      <h1>Bem-vindo, ${req.session.user}</h1>
      <p>Último acesso: ${lastAccess}</p>
      <h2>Cadastrar Produto</h2>
      <form action="/cadastro" method="POST">
        <input type="text" name="barcode" placeholder="Código de Barras" required>
        <input type="text" name="description" placeholder="Descrição" required>
        <input type="number" step="0.01" name="costPrice" placeholder="Preço de Custo" required>
        <input type="number" step="0.01" name="salePrice" placeholder="Preço de Venda" required>
        <input type="date" name="expiryDate" required>
        <input type="number" name="stock" placeholder="Quantidade em Estoque" required>
        <input type="text" name="manufacturer" placeholder="Fabricante" required>
        <button type="submit">Cadastrar</button>
      </form>

      <h2>Produtos Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Preço de Custo</th>
            <th>Preço de Venda</th>
            <th>Validade</th>
            <th>Qtd</th>
            <th>Fabricante</th>
          </tr>
        </thead>
        <tbody>
          ${produtosList}
        </tbody>
      </table>
    </body>
    </html>
  `);
});

app.post("/cadastro", isAuthenticated, (req, res) => {
  const {
    barcode,
    description,
    costPrice,
    salePrice,
    expiryDate,
    stock,
    manufacturer,
  } = req.body;
  produtos.push({
    barcode,
    description,
    costPrice,
    salePrice,
    expiryDate,
    stock,
    manufacturer,
  });
  res.redirect("/cadastro");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
