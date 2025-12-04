// Scanner de rotas do projeto Next (app router e pages router)
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const appDir = path.join(root, "app");
const pagesDir = path.join(root, "pages");

// Lista de rotas "ideais" (o que gostaríamos de ter no sistema)
const desiredFrontend = [
  {
    path: "/",
    descricao: "Página inicial / apresentação da distribuidora",
    prioridade: "ALTA"
  },
  {
    path: "/b2b",
    descricao: "Catálogo B2B público de produtos",
    prioridade: "ALTA"
  },
  {
    path: "/painel",
    descricao: "Tela de login do painel da distribuidora",
    prioridade: "ALTA"
  },
  {
    path: "/painel-distribuidora",
    descricao: "Dashboard interno da distribuidora após login",
    prioridade: "ALTA"
  },
  {
    path: "/admin/imagens-produto",
    descricao: "Upload de imagens de produtos com drag & drop",
    prioridade: "ALTA"
  },
  {
    path: "/admin/produtos",
    descricao: "Gestão de produtos (CRUD, CSV, etc.)",
    prioridade: "MEDIA"
  },
  {
    path: "/admin/clientes",
    descricao: "Gestão de clientes B2B",
    prioridade: "MEDIA"
  },
  {
    path: "/admin/pedidos",
    descricao: "Visualização e gestão de pedidos B2B",
    prioridade: "MEDIA"
  }
];

const desiredBackend = [
  {
    path: "/api/b2b/products",
    descricao: "Lista de produtos para o catálogo B2B",
    prioridade: "ALTA"
  },
  {
    path: "/api/admin/upload-product-image",
    descricao: "Upload de imagem + atualização de image_url do produto",
    prioridade: "ALTA"
  },
  {
    path: "/api/admin/produtos",
    descricao: "CRUD de produtos para o painel admin",
    prioridade: "MEDIA"
  },
  {
    path: "/api/admin/clientes",
    descricao: "CRUD de clientes B2B",
    prioridade: "MEDIA"
  },
  {
    path: "/api/admin/pedidos",
    descricao: "Operações de pedidos (lista, detalhes)",
    prioridade: "MEDIA"
  }
];

function collectFiles(startDir, filterFn, list) {
  if (!fs.existsSync(startDir)) return;
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, filterFn, list);
    } else if (filterFn(full)) {
      list.push(full);
    }
  }
}

function routeFromFile(filePath, baseDir, prefix = "") {
  const rel = path.relative(baseDir, filePath); // ex: "b2b\\page.tsx"
  const segments = rel.split(path.sep);
  segments.pop(); // remove "page.tsx" ou "route.ts"
  let route = prefix;
  if (segments.length === 0) {
    route = prefix || "/";
  } else {
    route += "/" + segments.join("/");
  }
  // normaliza barras duplas
  route = route.replace(/\/+/g, "/");
  if (!route.startsWith("/")) route = "/" + route;
  return route;
}

// 1) Coletar páginas (frontend)
const frontRoutes = [];

if (fs.existsSync(appDir)) {
  const appPages = [];
  collectFiles(
    appDir,
    (f) => /page\.(tsx|jsx|ts|js)$/.test(f),
    appPages
  );
  for (const file of appPages) {
    // se for página dentro de app/api, ignorar (é backend)
    if (file.includes(`${path.sep}api${path.sep}`)) continue;
    frontRoutes.push({
      type: "app",
      file,
      route: routeFromFile(file, appDir, "")
    });
  }
}

if (fs.existsSync(pagesDir)) {
  const legacyPages = [];
  collectFiles(
    pagesDir,
    (f) => /page\.(tsx|jsx|ts|js)$/.test(f) || /\.(tsx|jsx|ts|js)$/.test(f),
    legacyPages
  );
  for (const file of legacyPages) {
    const rel = path.relative(pagesDir, file);
    const noExt = rel.replace(/\.(tsx|jsx|ts|js)$/, "");
    let route = "/" + noExt.replace(/\\+/g, "/");
    if (route.endsWith("/index")) {
      route = route.replace(/\/index$/, "") || "/";
    }
    frontRoutes.push({
      type: "pages",
      file,
      route
    });
  }
}

// 2) Coletar rotas de API (backend)
const apiRoutes = [];
if (fs.existsSync(appDir)) {
  const appApiRouteFiles = [];
  const apiBase = path.join(appDir, "api");
  collectFiles(
    apiBase,
    (f) => /route\.(ts|js)$/.test(f),
    appApiRouteFiles
  );
  for (const file of appApiRouteFiles) {
    apiRoutes.push({
      type: "app-api",
      file,
      route: routeFromFile(file, apiBase, "/api")
    });
  }
}

// === Relatório ===
console.log("============================================================");
console.log("   MAPA DO PROJETO - ROTAS FRONTEND E BACKEND (NEXT.JS)");
console.log("   Raiz do projeto:", root);
console.log("============================================================\n");

// FRONTEND
console.log("1) ROTAS DE PÁGINA (FRONTEND)\n");

if (frontRoutes.length === 0) {
  console.log("   Nenhuma rota de página encontrada (verifique pasta 'app' ou 'pages').\n");
} else {
  frontRoutes
    .sort((a, b) => a.route.localeCompare(b.route))
    .forEach((r, idx) => {
      console.log(
        `   ${idx + 1}. [${r.type === "app" ? "app" : "pages"}] ${r.route}  ->  ${path.relative(root, r.file)}`
      );
    });
  console.log("");
}

// BACKEND
console.log("2) ROTAS DE API (BACKEND)\n");

if (apiRoutes.length === 0) {
  console.log("   Nenhuma rota de API encontrada (pasta 'app/api').\n");
} else {
  apiRoutes
    .sort((a, b) => a.route.localeCompare(b.route))
    .forEach((r, idx) => {
      console.log(
        `   ${idx + 1}. [api] ${r.route}  ->  ${path.relative(root, r.file)}`
      );
    });
  console.log("");
}

// 3) Comparação com rotas desejadas (faltantes / implementadas)
function compareDesired(desired, existingRoutes, titulo, tipo) {
  console.log("------------------------------------------------------------");
  console.log(`3) ROTAS ${tipo.toUpperCase()} - O QUE TEMOS x O QUE FALTA`);
  console.log("------------------------------------------------------------\n");

  const existingSet = new Set(existingRoutes.map((r) => r.route));

  console.log("   Já implementadas:");
  let countOk = 0;
  desired.forEach((d, idx) => {
    if (existingSet.has(d.path)) {
      countOk++;
      console.log(
        `   ✔ [${d.prioridade}] ${d.path}  -  ${d.descricao}`
      );
    }
  });
  if (countOk === 0) {
    console.log("   (nenhuma rota esperada encontrada ainda)");
  }

  console.log("\n   FALTANDO implementar:");
  let countMissing = 0;
  desired.forEach((d) => {
    if (!existingSet.has(d.path)) {
      countMissing++;
      console.log(
        `   ✖ [${d.prioridade}] ${d.path}  -  ${d.descricao}`
      );
    }
  });
  if (countMissing === 0) {
    console.log("   (nenhuma rota faltando em relação à lista desejada) 🚀");
  }
  console.log("\n");
}

compareDesired(desiredFrontend, frontRoutes, "Frontend", "frontend");
compareDesired(desiredBackend, apiRoutes, "Backend", "backend");

console.log("============================================================");
console.log("   LEGENDA / PRIORIDADES");
console.log("   - ALTA  : necessário para operação básica B2B (login, catálogo, upload de imagens).");
console.log("   - MEDIA : módulos de gestão (produtos, clientes, pedidos) para evoluir o sistema.");
console.log("   - BAIXA : melhorias futuras, relatórios, dashboards avançados etc.");
console.log("============================================================");
